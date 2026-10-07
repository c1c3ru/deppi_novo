import { ResumoExtraido, chaveDoTitulo, montarConteudo } from './resumo-parser';

/**
 * Laço da importação em lote, sem Angular: um trabalho por vez, com pausa,
 * parada automática e retomada sem perder o que já foi feito.
 */

export type EstadoEnvio =
  | 'aguardando'
  | 'enviando'
  | 'importado'
  | 'importado-aviso'
  | 'ja-existia'
  | 'falhou';

export interface ItemLote {
  id: number;
  arquivo: string;
  dados?: ResumoExtraido;
  pdf?: File;
  recusa?: string;
  suspeitas: string[];
  avisos: string[];
  selecionado: boolean;
  /** O título já está cadastrado na edição escolhida (conferido ao escolher). */
  jaNaEdicao?: boolean;
  estado: EstadoEnvio;
  detalhe?: string;
  /** PDF já enviado numa tentativa anterior (não reenvia ao tentar de novo). */
  pdfUrl?: string;
  artigoId?: number;
}

export interface TrabalhoExistente {
  title: string;
  order?: number;
}

/** Operações de rede, injetadas para o laço poder ser testado sem servidor. */
export interface PortaImportacao {
  trabalhosDaEdicao(): Promise<TrabalhoExistente[]>;
  enviarPdf(arquivo: File): Promise<string>;
  criarTrabalho(dados: {
    title: string;
    authors: string;
    summary: string;
    content: string;
    order: number;
  }): Promise<number>;
  esperar(ms: number): Promise<void>;
}

export const PAUSA_ENTRE_ITENS_MS = 400;
export const MAX_FALHAS_SEGUIDAS = 3;

function statusDe(erro: unknown): number {
  const status = (erro as { status?: unknown })?.status;
  return typeof status === 'number' ? status : 0;
}

function mensagemDe(erro: unknown): string {
  const corpo = (erro as { error?: { error?: unknown; message?: unknown } })
    ?.error;
  const texto = corpo?.error ?? corpo?.message;
  return typeof texto === 'string' && texto.trim()
    ? texto.trim().slice(0, 200)
    : '';
}

/** Erros que param o lote inteiro (não adianta seguir para o próximo item). */
function motivoDeParada(status: number): string | null {
  if (status === 401)
    return 'Sua sessão expirou. Entre de novo no site e clique em "Continuar".';
  if (status === 403)
    return 'Sua conta não tem permissão para cadastrar trabalhos.';
  if (status === 429) {
    return 'O servidor limitou o número de requisições. Espere uns 15 minutos e clique em "Continuar".';
  }
  return null;
}

function falhaDoServidor(status: number): boolean {
  return status === 0 || status >= 500;
}

function descreverErro(erro: unknown, acao: string): string {
  const status = statusDe(erro);
  if (status === 0) return `Sem resposta do servidor ao ${acao}.`;
  const msg = mensagemDe(erro);
  return msg
    ? `Erro ${status} ao ${acao}: ${msg}`
    : `Erro ${status} ao ${acao}.`;
}

export class ImportadorLote {
  executando = false;
  pausado = false;
  motivoParada: string | null = null;

  private falhasSeguidas = 0;
  private cancelado = false;
  private retomar: (() => void) | null = null;

  constructor(
    private readonly porta: PortaImportacao,
    private readonly aoMudar: () => void = () => undefined
  ) {}

  pausar(): void {
    if (this.executando) this.pausado = true;
    this.aoMudar();
  }

  /** Para depois do item atual (ex.: ao sair da tela). */
  cancelar(): void {
    this.cancelado = true;
    this.continuar();
  }

  continuar(): void {
    this.pausado = false;
    this.retomar?.();
    this.retomar = null;
    this.aoMudar();
  }

  /** Processa, em ordem, os itens selecionados que ainda estão aguardando. */
  async executar(
    itens: ItemLote[],
    opcoes: { enviarPdf: boolean }
  ): Promise<void> {
    if (this.executando) return;
    this.executando = true;
    this.pausado = false;
    this.motivoParada = null;
    this.falhasSeguidas = 0;
    this.aoMudar();

    try {
      for (const item of itens) {
        if (!item.selecionado || item.estado !== 'aguardando' || !item.dados)
          continue;
        if (this.pausado) {
          await new Promise<void>((resolve) => (this.retomar = resolve));
        }
        if (this.cancelado) break;

        const parada = await this.processar(item, opcoes.enviarPdf);
        this.aoMudar();
        if (parada) {
          this.motivoParada = parada;
          break;
        }
        await this.porta.esperar(PAUSA_ENTRE_ITENS_MS);
      }
    } finally {
      this.executando = false;
      this.pausado = false;
      this.retomar = null;
      this.aoMudar();
    }
  }

  /** Devolve o motivo quando o lote precisa parar. */
  private async processar(
    item: ItemLote,
    enviarPdf: boolean
  ): Promise<string | null> {
    const dados = item.dados!;
    item.estado = 'enviando';
    item.detalhe = undefined;
    this.aoMudar();

    // 1. Relê a edição a cada item: evita duplicar se outra pessoa (ou uma
    //    tentativa anterior que pareceu falhar) já cadastrou o trabalho.
    let existentes: TrabalhoExistente[];
    try {
      existentes = await this.porta.trabalhosDaEdicao();
    } catch (erro) {
      return this.registrarFalha(item, erro, 'conferir os trabalhos da edição');
    }
    const chave = chaveDoTitulo(dados.titulo);
    if (existentes.some((t) => chaveDoTitulo(t.title) === chave)) {
      item.estado = 'ja-existia';
      item.detalhe = 'Já existia na edição; não foi duplicado.';
      this.falhasSeguidas = 0;
      return null;
    }
    const ordem =
      existentes.reduce((max, t) => Math.max(max, Number(t.order) || 0), 0) + 1;

    // 2. PDF (opcional). Se falhar, importa sem PDF e avisa.
    let avisoPdf: string | null = null;
    if (enviarPdf && item.pdf && !item.pdfUrl) {
      try {
        item.pdfUrl = await this.porta.enviarPdf(item.pdf);
      } catch (erro) {
        const parada = motivoDeParada(statusDe(erro));
        if (parada) {
          item.estado = 'aguardando';
          item.detalhe = 'Não enviado: o lote parou antes deste item.';
          return parada;
        }
        avisoPdf = `Importado sem PDF (${descreverErro(erro, 'enviar o PDF')}). Anexe pelo botão Editar.`;
      }
    }

    // 3. Cria o trabalho.
    try {
      item.artigoId = await this.porta.criarTrabalho({
        title: dados.titulo,
        authors: dados.autores,
        summary: dados.resumo,
        content: montarConteudo(dados, enviarPdf ? item.pdfUrl : null),
        order: ordem,
      });
    } catch (erro) {
      return this.registrarFalha(item, erro, 'criar o trabalho');
    }

    this.falhasSeguidas = 0;
    if (avisoPdf) {
      item.estado = 'importado-aviso';
      item.detalhe = avisoPdf;
    } else if (enviarPdf && !item.pdf) {
      item.estado = 'importado-aviso';
      item.detalhe = 'Importado sem PDF (não havia PDF com o mesmo nome).';
    } else {
      item.estado = 'importado';
      item.detalhe =
        item.pdfUrl && enviarPdf ? 'Importado com PDF.' : 'Importado.';
    }
    return null;
  }

  private registrarFalha(
    item: ItemLote,
    erro: unknown,
    acao: string
  ): string | null {
    const status = statusDe(erro);
    const parada = motivoDeParada(status);
    if (parada) {
      item.estado = 'aguardando';
      item.detalhe = 'Não enviado: o lote parou antes deste item.';
      return parada;
    }
    item.estado = 'falhou';
    item.detalhe = descreverErro(erro, acao);
    if (falhaDoServidor(status)) {
      this.falhasSeguidas++;
      if (this.falhasSeguidas >= MAX_FALHAS_SEGUIDAS) {
        return `O servidor falhou ${MAX_FALHAS_SEGUIDAS} vezes seguidas. Confira se o site está no ar e use "Tentar novamente os que falharam".`;
      }
    } else {
      this.falhasSeguidas = 0;
    }
    return null;
  }
}
