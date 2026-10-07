import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RevistaEdicao } from '../../../../shared/models';
import { UploadService } from '../../../../core/services/upload.service';
import { AnaisService } from '../../services/anais.service';
import { ANAIS_BASE_STYLES } from '../../anais.styles';
import {
  ImportadorLote,
  ItemLote,
  PortaImportacao,
} from '../../importacao/importador-lote';
import { prepararLote } from '../../importacao/preparar-lote';
import { chaveDoTitulo, gerarCsv } from '../../importacao/resumo-parser';

type Selo = {
  texto: string;
  tipo: 'ok' | 'aviso' | 'erro' | 'neutro' | 'info';
};

/**
 * Importação em lote dos resumos da submissão (SIC) numa edição dos anais.
 * Os arquivos são lidos no navegador; nada vai para o servidor antes do
 * clique em "Importar". Depois, um trabalho por vez, pela mesma API do
 * cadastro manual.
 */
@Component({
  standalone: false,
  selector: 'app-anais-importacao-lote',
  template: `
    <div class="importacao animate-in">
      <button type="button" class="voltar" (click)="voltar()">
        &larr; Voltar
      </button>
      <p class="anais-kicker">Administração</p>
      <h1>Importar resumos em lote</h1>

      <section class="anais-card">
        <h2>1. Edição e arquivos</h2>
        <label class="campo">
          <span>Edição que vai receber os trabalhos</span>
          <select
            [disabled]="importador.executando"
            (change)="escolherEdicao($any($event.target).value)"
            data-testid="edicao"
          >
            <option value="" disabled [selected]="!edicaoId">
              Escolha a edição
            </option>
            <option
              *ngFor="let e of edicoes"
              [value]="e.id"
              [selected]="e.id === edicaoId"
            >
              Vol. {{ e.volume }} ({{ e.ano }}) &middot; {{ e.title }}
              {{ e.status === 'draft' ? '(rascunho)' : '' }}
            </option>
          </select>
        </label>
        <p class="erro-inline" *ngIf="erroEdicao">{{ erroEdicao }}</p>
        <p class="anais-muted" *ngIf="edicaoId && existentes !== null">
          A edição já tem {{ existentes.size }}
          {{ existentes.size === 1 ? 'trabalho' : 'trabalhos' }}.
        </p>

        <label class="campo">
          <span>Arquivos da submissão</span>
          <input
            type="file"
            multiple
            accept=".zip,.docx,.pdf"
            [disabled]="lendo || importador.executando"
            (change)="escolherArquivos($event)"
            data-testid="arquivos"
          />
        </label>
        <p class="anais-muted">
          Escolha o .zip baixado do formulário ou os .docx e .pdf soltos. O PDF
          é ligado ao .docx de mesmo nome (<em>nome.docx.pdf</em> ou
          <em>nome.pdf</em>). A leitura é feita no seu navegador: nada é enviado
          antes de clicar em "Importar".
        </p>
        <label class="opcao">
          <input
            type="checkbox"
            [checked]="enviarPdf"
            [disabled]="importador.executando"
            (change)="enviarPdf = $any($event.target).checked"
          />
          Enviar também o PDF de cada trabalho (vira o botão "PDF" nos anais)
        </label>
        <p class="anais-muted" *ngIf="lendo">Lendo os arquivos...</p>
        <p class="erro-inline" *ngFor="let e of errosZip">{{ e }}</p>
        <p class="anais-muted" *ngIf="ignorados > 0">
          {{ ignorados }}
          {{ ignorados === 1 ? 'arquivo ignorado' : 'arquivos ignorados' }}
          (não são .docx nem .pdf).
        </p>
      </section>

      <section class="anais-card painel" *ngIf="itens.length > 0">
        <h2>2. Conferir e importar</h2>
        <div class="chips" data-testid="chips">
          <span class="chip">{{ plural(itens.length, 'lido', 'lidos') }}</span>
          <span class="chip ok">{{
            plural(contar('pronto'), 'pronto', 'prontos')
          }}</span>
          <span class="chip aviso" *ngIf="contar('aviso')"
            >{{ contar('aviso') }} com aviso</span
          >
          <span class="chip aviso" *ngIf="contar('suspeito')"
            >{{
              plural(contar('suspeito'), 'suspeito', 'suspeitos')
            }}
            (desmarcados)</span
          >
          <span class="chip neutro" *ngIf="contar('existe')"
            >{{ contar('existe') }} já na edição</span
          >
          <span class="chip erro" *ngIf="contar('recusado')">{{
            plural(contar('recusado'), 'recusado', 'recusados')
          }}</span>
          <span class="chip info">{{
            plural(selecionados.length, 'marcado', 'marcados')
          }}</span>
        </div>
        <div class="progresso" *ngIf="totalLote > 0" data-testid="progresso">
          <div
            class="barra"
            role="progressbar"
            [attr.aria-valuenow]="concluidosLote"
            aria-valuemin="0"
            [attr.aria-valuemax]="totalLote"
          >
            <span [style.width.%]="(concluidosLote / totalLote) * 100"></span>
          </div>
          <span class="anais-muted"
            >{{ concluidosLote }} de {{ totalLote }} processados</span
          >
        </div>

        <div class="chips" *ngIf="totalLote > 0">
          <span class="chip ok">{{
            plural(contarEstado('importado'), 'importado', 'importados')
          }}</span>
          <span class="chip aviso" *ngIf="contarEstado('importado-aviso')"
            >{{ contarEstado('importado-aviso') }} com aviso</span
          >
          <span class="chip neutro" *ngIf="contarEstado('ja-existia')">{{
            plural(contarEstado('ja-existia'), 'já existia', 'já existiam')
          }}</span>
          <span class="chip erro" *ngIf="contarEstado('falhou')">{{
            plural(contarEstado('falhou'), 'falhou', 'falharam')
          }}</span>
          <span class="chip" *ngIf="pendentes.length">{{
            plural(pendentes.length, 'pendente', 'pendentes')
          }}</span>
        </div>

        <p class="parada erro-inline" *ngIf="importador.motivoParada">
          Importação interrompida: {{ importador.motivoParada }} O que já foi
          importado continua salvo.
        </p>

        <div
          class="resumo-final"
          *ngIf="fim"
          [ngClass]="fim.tipo"
          data-testid="resumo-final"
        >
          {{ fim.texto }}
        </div>

        <div class="acoes">
          <button
            type="button"
            class="anais-button"
            *ngIf="!importador.executando && pendentes.length === 0"
            [disabled]="!edicaoId || novos.length === 0 || lendo"
            (click)="importar()"
            data-testid="importar"
          >
            Importar {{ novos.length }}
            {{ novos.length === 1 ? 'trabalho' : 'trabalhos' }}
          </button>
          <button
            type="button"
            class="anais-button secondary"
            *ngIf="importador.executando && !importador.pausado"
            (click)="importador.pausar()"
          >
            Pausar
          </button>
          <button
            type="button"
            class="anais-button"
            *ngIf="importador.executando && importador.pausado"
            (click)="importador.continuar()"
          >
            Retomar
          </button>
          <button
            type="button"
            class="anais-button"
            *ngIf="
              !importador.executando && totalLote > 0 && pendentes.length > 0
            "
            [disabled]="!edicaoId"
            (click)="rodar()"
          >
            Continuar ({{ pendentes.length }} pendentes)
          </button>
          <button
            type="button"
            class="anais-button secondary"
            *ngIf="!importador.executando && contarEstado('falhou') > 0"
            (click)="tentarFalhas()"
          >
            Tentar novamente os que falharam
          </button>
          <button
            type="button"
            class="anais-button secondary"
            *ngIf="totalLote > 0"
            [disabled]="importador.executando"
            (click)="baixarRelatorio()"
          >
            Baixar relatório (CSV)
          </button>
          <a
            class="anais-button secondary"
            *ngIf="!importador.executando && totalLote > 0 && edicaoId"
            [routerLink]="['/anais/edicoes', edicaoId]"
            >Ver a edição</a
          >
        </div>
        <p class="anais-muted" *ngIf="importador.executando">
          Não feche esta aba enquanto a importação estiver em andamento.
        </p>
      </section>
      <section class="anais-card" *ngIf="itens.length > 0">
        <h2>Arquivos lidos</h2>
        <div class="acoes-lista">
          <button
            type="button"
            class="anais-button secondary"
            [disabled]="importador.executando"
            (click)="marcarTodos(true)"
          >
            Marcar todos os aproveitáveis
          </button>
          <button
            type="button"
            class="anais-button secondary"
            [disabled]="importador.executando"
            (click)="marcarTodos(false)"
          >
            Desmarcar todos
          </button>
        </div>

        <ul class="lista" data-testid="lista">
          <li
            *ngFor="let item of itens; trackBy: porId"
            [class.recusado]="item.recusa"
          >
            <label class="linha">
              <input
                type="checkbox"
                [checked]="item.selecionado"
                [disabled]="!podeMarcar(item)"
                (change)="item.selecionado = $any($event.target).checked"
              />
              <span class="linha-texto">
                <strong>{{ item.dados?.titulo || item.arquivo }}</strong>
                <span class="anais-muted autores" *ngIf="item.dados?.autores">{{
                  item.dados?.autores
                }}</span>
                <span class="anais-muted arquivo">{{ item.arquivo }}</span>
              </span>
              <span class="selo" [ngClass]="selo(item).tipo">{{
                selo(item).texto
              }}</span>
            </label>
            <p class="motivo erro-inline" *ngIf="item.recusa">
              {{ item.recusa }}
            </p>
            <p class="motivo" *ngIf="item.detalhe">{{ item.detalhe }}</p>
            <ul
              class="motivos"
              *ngIf="
                !item.recusa &&
                (item.suspeitas.length || item.avisos.length || item.jaNaEdicao)
              "
            >
              <li *ngIf="item.jaNaEdicao">
                Este título já está cadastrado na edição.
              </li>
              <li *ngFor="let s of item.suspeitas" class="suspeita">{{ s }}</li>
              <li *ngFor="let a of item.avisos">{{ a }}</li>
            </ul>
            <details *ngIf="item.dados">
              <summary>Ver o que será cadastrado</summary>
              <dl class="anais-dl">
                <dt>Autores</dt>
                <dd>{{ item.dados.autores || '—' }}</dd>
                <dt>Instituições</dt>
                <dd>
                  <span
                    *ngFor="let i of item.dados.instituicoes"
                    class="bloco"
                    >{{ i }}</span
                  >
                  <span *ngIf="item.dados.instituicoes.length === 0">—</span>
                </dd>
                <dt>Palavras-chave</dt>
                <dd>{{ item.dados.palavrasChave.join('; ') || '—' }}</dd>
                <dt>PDF</dt>
                <dd>{{ item.pdf?.name || '—' }}</dd>
                <dt>Resumo</dt>
                <dd class="resumo">{{ item.dados.resumo }}</dd>
              </dl>
            </details>
          </li>
        </ul>
      </section>
    </div>
  `,
  styles: [
    ANAIS_BASE_STYLES,
    `
      .importacao {
        max-width: 960px;
        margin: 0 auto;
      }
      h1 {
        font-size: clamp(1.5rem, 4vw, 2rem);
        margin: 0 0 1.2rem;
      }
      .voltar {
        background: none;
        border: none;
        padding: 0;
        margin-bottom: 1rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        cursor: pointer;
      }
      .campo {
        display: block;
        margin-bottom: 0.9rem;
      }
      .campo span {
        display: block;
        font-weight: 700;
        margin-bottom: 0.35rem;
        color: var(--color-text);
      }
      .campo select,
      .campo input[type='file'] {
        width: 100%;
        padding: 0.6rem 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-sm);
        background: var(--color-background);
        color: var(--color-text);
        font: inherit;
      }
      .opcao input,
      .linha input {
        width: auto;
        flex: 0 0 auto;
        margin: 0.3rem 0 0;
      }
      .opcao {
        display: flex;
        gap: 0.5rem;
        align-items: flex-start;
        margin: 0.4rem 0 0.6rem;
        color: var(--color-text);
      }
      .erro-inline {
        color: var(--color-error-text) !important;
        font-size: 0.9rem;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 0.9rem;
      }
      .chip {
        font-size: 0.8rem;
        font-weight: 700;
        padding: 0.25rem 0.65rem;
        border-radius: var(--border-radius-full);
        background: var(--color-background-secondary);
        color: var(--color-text-secondary);
      }
      .chip.ok,
      .selo.ok {
        background: rgba(var(--color-success-rgb), 0.15);
        color: var(--color-success-text);
      }
      .chip.aviso,
      .selo.aviso {
        background: rgba(var(--color-warning-rgb), 0.18);
        color: var(--color-warning-text);
      }
      .chip.erro,
      .selo.erro {
        background: rgba(var(--color-error-rgb), 0.12);
        color: var(--color-error-text);
      }
      .chip.info,
      .selo.info {
        background: rgba(var(--color-info-rgb), 0.14);
        color: var(--color-info-text);
      }
      .selo.neutro {
        background: var(--color-background-secondary);
        color: var(--color-text-secondary);
      }
      .acoes-lista {
        margin-bottom: 0.6rem;
      }
      .lista {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .lista > li {
        border-top: 1px solid var(--color-border);
        padding: 0.75rem 0;
      }
      .lista > li.recusado .linha-texto strong {
        color: var(--color-text-muted);
      }
      .linha {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: 0.6rem;
        align-items: start;
        cursor: pointer;
      }
      .linha-texto {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        min-width: 0;
      }
      .linha-texto strong {
        color: var(--color-text);
        font-size: 0.95rem;
      }
      .autores,
      .arquivo {
        font-size: 0.82rem;
      }
      .arquivo {
        word-break: break-all;
      }
      .selo {
        font-size: 0.75rem;
        font-weight: 800;
        padding: 0.2rem 0.6rem;
        border-radius: var(--border-radius-full);
        white-space: nowrap;
      }
      .motivo,
      .motivos {
        margin: 0.35rem 0 0 1.9rem !important;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
      }
      .motivos {
        padding-left: 1rem;
      }
      .motivos .suspeita {
        color: var(--color-warning-text);
        font-weight: 600;
      }
      details {
        margin: 0.4rem 0 0 1.9rem;
        font-size: 0.88rem;
      }
      details summary {
        cursor: pointer;
        color: var(--color-primary-dark);
        font-weight: 700;
        margin-bottom: 0.5rem;
      }
      .bloco {
        display: block;
      }
      .resumo {
        white-space: pre-line;
        text-align: justify;
      }
      .progresso {
        margin-bottom: 0.8rem;
      }
      .barra {
        height: 10px;
        border-radius: var(--border-radius-full);
        background: var(--color-background-secondary);
        overflow: hidden;
        margin-bottom: 0.3rem;
      }
      .barra span {
        display: block;
        height: 100%;
        background: var(--color-primary);
        transition: width 0.3s ease;
      }
      .resumo-final {
        padding: 0.8rem 1rem;
        border-radius: var(--border-radius-sm);
        font-weight: 700;
        margin-bottom: 0.8rem;
      }
      .resumo-final.ok {
        background: rgba(var(--color-success-rgb), 0.15);
        color: var(--color-success-text);
      }
      .resumo-final.aviso {
        background: rgba(var(--color-warning-rgb), 0.18);
        color: var(--color-warning-text);
      }
      .resumo-final.erro {
        background: rgba(var(--color-error-rgb), 0.12);
        color: var(--color-error-text);
      }
      @media (max-width: 640px) {
        .linha {
          grid-template-columns: auto minmax(0, 1fr);
        }
        .selo {
          grid-column: 2;
          justify-self: start;
        }
      }
    `,
  ],
})
export class AnaisImportacaoLoteComponent implements OnInit, OnDestroy {
  private readonly anaisService = inject(AnaisService);
  private readonly uploadService = inject(UploadService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  edicoes: RevistaEdicao[] = [];
  edicaoId: number | null = null;
  erroEdicao = '';
  /** Títulos (normalizados) já cadastrados na edição escolhida. */
  existentes: Set<string> | null = null;

  itens: ItemLote[] = [];
  ignorados = 0;
  errosZip: string[] = [];
  lendo = false;
  enviarPdf = true;

  /** Itens que entraram no lote ao clicar em Importar. */
  private lote: ItemLote[] = [];

  private readonly porta: PortaImportacao = {
    trabalhosDaEdicao: async () => {
      const edicao = await firstValueFrom(
        this.anaisService.getEdicaoSilenciosa(this.edicaoId!)
      );
      return edicao.artigos ?? [];
    },
    enviarPdf: async (arquivo) =>
      (await firstValueFrom(this.uploadService.uploadFileSilencioso(arquivo)))
        .url,
    criarTrabalho: async (dados) =>
      (
        await firstValueFrom(
          this.anaisService.createArtigoSilencioso(this.edicaoId!, dados)
        )
      ).id,
    esperar: (ms) => new Promise((r) => setTimeout(r, ms)),
  };

  readonly importador = new ImportadorLote(this.porta, () =>
    this.cdr.markForCheck()
  );

  ngOnInit(): void {
    const param = Number(this.route.snapshot.paramMap.get('edicaoId'));
    this.anaisService.getAdminEdicoes().subscribe({
      next: (res) => {
        this.edicoes = res.data ?? [];
        if (param && this.edicoes.some((e) => e.id === param)) {
          this.escolherEdicao(String(param));
        }
      },
      error: () => {
        this.erroEdicao = 'Não foi possível carregar as edições.';
      },
    });
  }

  ngOnDestroy(): void {
    // Saiu da tela no meio do lote: termina o item atual e para.
    this.importador.cancelar();
  }

  @HostListener('window:beforeunload', ['$event'])
  avisarSaida(evento: BeforeUnloadEvent): void {
    if (this.importador.executando) evento.preventDefault();
  }

  get selecionados(): ItemLote[] {
    return this.itens.filter((i) => i.selecionado && i.dados);
  }

  /** Marcados que ainda não entraram em nenhuma importação. */
  get novos(): ItemLote[] {
    return this.selecionados.filter((i) => !this.lote.includes(i));
  }

  get totalLote(): number {
    return this.lote.length;
  }

  get concluidosLote(): number {
    return this.lote.filter(
      (i) => i.estado !== 'aguardando' && i.estado !== 'enviando'
    ).length;
  }

  get pendentes(): ItemLote[] {
    return this.lote.filter((i) => i.estado === 'aguardando');
  }

  get fim(): { texto: string; tipo: 'ok' | 'aviso' | 'erro' } | null {
    if (this.importador.executando || this.totalLote === 0) return null;
    if (this.pendentes.length > 0) return null;
    const ok = this.contarEstado('importado');
    const aviso = this.contarEstado('importado-aviso');
    const existia = this.contarEstado('ja-existia');
    const falhou = this.contarEstado('falhou');
    const partes = [this.plural(ok + aviso, 'importado', 'importados')];
    if (aviso) partes.push(`${aviso} com aviso`);
    if (existia) partes.push(this.plural(existia, 'já existia', 'já existiam'));
    if (falhou) partes.push(this.plural(falhou, 'falhou', 'falharam'));
    const texto = `Importação concluída: ${partes.join(', ')}.`;
    if (falhou > 0) return { texto, tipo: ok + aviso > 0 ? 'aviso' : 'erro' };
    return { texto, tipo: aviso > 0 ? 'aviso' : 'ok' };
  }

  plural(n: number, singular: string, plural: string): string {
    return `${n} ${n === 1 ? singular : plural}`;
  }

  porId(_: number, item: ItemLote): number {
    return item.id;
  }

  private categoria(
    item: ItemLote
  ): 'recusado' | 'existe' | 'suspeito' | 'aviso' | 'pronto' {
    if (item.recusa) return 'recusado';
    if (item.jaNaEdicao) return 'existe';
    if (item.suspeitas.length) return 'suspeito';
    if (item.avisos.length) return 'aviso';
    return 'pronto';
  }

  contar(cat: string): number {
    return this.itens.filter((i) => this.categoria(i) === cat).length;
  }

  contarEstado(estado: ItemLote['estado']): number {
    return this.lote.filter((i) => i.estado === estado).length;
  }

  podeMarcar(item: ItemLote): boolean {
    return (
      !!item.dados && !this.importador.executando && !this.lote.includes(item)
    );
  }

  selo(item: ItemLote): Selo {
    if (this.lote.includes(item)) {
      switch (item.estado) {
        case 'enviando':
          return { texto: 'Enviando…', tipo: 'info' };
        case 'importado':
          return { texto: '✔ Importado', tipo: 'ok' };
        case 'importado-aviso':
          return { texto: '⚠ Importado com aviso', tipo: 'aviso' };
        case 'ja-existia':
          return { texto: 'Já existia', tipo: 'neutro' };
        case 'falhou':
          return { texto: '✖ Falhou', tipo: 'erro' };
        default:
          return { texto: 'Na fila', tipo: 'neutro' };
      }
    }
    switch (this.categoria(item)) {
      case 'recusado':
        return { texto: '✖ Recusado', tipo: 'erro' };
      case 'existe':
        return { texto: 'Já na edição', tipo: 'neutro' };
      case 'suspeito':
        return { texto: '⚠ Suspeito', tipo: 'aviso' };
      case 'aviso':
        return { texto: '⚠ Aviso', tipo: 'aviso' };
      default:
        return { texto: 'Pronto', tipo: 'ok' };
    }
  }

  escolherEdicao(valor: string): void {
    const id = Number(valor);
    this.edicaoId = id || null;
    this.existentes = null;
    this.erroEdicao = '';
    if (!this.edicaoId) return;
    this.anaisService.getEdicaoSilenciosa(this.edicaoId).subscribe({
      next: (edicao) => {
        if (edicao.id !== this.edicaoId) return;
        this.existentes = new Set(
          (edicao.artigos ?? []).map((a) => chaveDoTitulo(a.title))
        );
        this.marcarExistentes();
      },
      error: () => {
        this.erroEdicao =
          'Não foi possível conferir os trabalhos desta edição agora. A conferência é refeita na importação.';
      },
    });
  }

  async escolherArquivos(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const arquivos = Array.from(input.files ?? []);
    if (arquivos.length === 0) return;
    this.lendo = true;
    this.lote = [];
    this.importador.motivoParada = null;
    try {
      const lido = await prepararLote(arquivos);
      this.itens = lido.itens;
      this.ignorados = lido.ignorados;
      this.errosZip = lido.errosZip;
      this.marcarExistentes();
    } catch {
      this.errosZip = ['Não foi possível ler os arquivos escolhidos.'];
    } finally {
      this.lendo = false;
      input.value = '';
      this.cdr.markForCheck();
    }
  }

  private marcarExistentes(): void {
    for (const item of this.itens) {
      if (this.lote.includes(item) || !item.dados) continue;
      const existe =
        !!this.existentes &&
        this.existentes.has(chaveDoTitulo(item.dados.titulo));
      if (existe) item.selecionado = false;
      else if (item.jaNaEdicao) item.selecionado = item.suspeitas.length === 0;
      item.jaNaEdicao = existe;
    }
  }

  marcarTodos(valor: boolean): void {
    for (const item of this.itens) {
      if (!this.podeMarcar(item)) continue;
      item.selecionado =
        valor && !item.jaNaEdicao && item.suspeitas.length === 0;
    }
  }

  importar(): void {
    const escolhidos = this.novos;
    const edicao = this.edicoes.find((e) => e.id === this.edicaoId);
    if (!edicao || escolhidos.length === 0) return;
    const comPdf = this.enviarPdf ? ' com os PDFs' : ' sem PDF';
    if (
      !confirm(
        `Importar ${escolhidos.length} trabalhos${comPdf} na edição "${edicao.title}" (vol. ${edicao.volume}, ${edicao.ano})?\n\nTrabalhos com título já cadastrado são pulados.`
      )
    ) {
      return;
    }
    this.lote = [...this.lote, ...escolhidos];
    for (const item of escolhidos) {
      item.estado = 'aguardando';
      item.detalhe = undefined;
    }
    this.rodar();
  }

  rodar(): void {
    void this.importador.executar(this.lote, { enviarPdf: this.enviarPdf });
  }

  tentarFalhas(): void {
    for (const item of this.lote) {
      if (item.estado === 'falhou') {
        item.estado = 'aguardando';
        item.detalhe = undefined;
      }
    }
    this.rodar();
  }

  baixarRelatorio(): void {
    const situacao: Record<ItemLote['estado'], string> = {
      aguardando: 'Pendente',
      enviando: 'Enviando',
      importado: 'Importado',
      'importado-aviso': 'Importado com aviso',
      'ja-existia': 'Já existia',
      falhou: 'Falhou',
    };
    const linhas = this.itens.map((i) => {
      const noLote = this.lote.includes(i);
      const estado = noLote
        ? situacao[i.estado]
        : i.recusa
          ? 'Recusado'
          : 'Não selecionado';
      const detalhe = noLote
        ? (i.detalhe ?? '')
        : [i.recusa, ...i.suspeitas, ...i.avisos].filter(Boolean).join(' | ');
      return [
        i.arquivo,
        i.dados?.titulo ?? '',
        i.dados?.autores ?? '',
        estado,
        detalhe,
        i.pdf?.name ?? '',
        i.artigoId ?? '',
      ];
    });
    const csv = gerarCsv(
      [
        'Arquivo',
        'Título',
        'Autores',
        'Situação',
        'Detalhe',
        'PDF',
        'ID do trabalho',
      ],
      linhas
    );
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `importacao-anais-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  voltar(): void {
    if (this.edicaoId) this.router.navigate(['/anais/edicoes', this.edicaoId]);
    else this.router.navigate(['/anais/edicoes']);
  }
}
