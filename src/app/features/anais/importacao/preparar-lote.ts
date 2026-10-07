import { ItemLote } from './importador-lote';
import { listarZip, lerLinhasDocx } from './leitor-docx';
import {
  chaveDoArquivo,
  chaveDoTitulo,
  lerResumo,
  nomeLegivel,
} from './resumo-parser';

export const LIMITE_ZIP = 300 * 1024 * 1024;
export const LIMITE_DOCX = 20 * 1024 * 1024;
/** Mesmo teto do upload do backend. */
export const LIMITE_PDF = 15 * 1024 * 1024;

interface Bruto {
  nome: string;
  tamanho: number;
  bytes: () => Promise<Uint8Array>;
}

export interface LotePreparado {
  itens: ItemLote[];
  /** Arquivos que não são .docx nem .pdf. */
  ignorados: number;
  /** Arquivos .zip que não puderam ser abertos, com o motivo. */
  errosZip: string[];
}

function ehLixo(nome: string): boolean {
  const base = nome.split('/').pop() ?? nome;
  return (
    nome.startsWith('__MACOSX/') ||
    base.startsWith('~$') ||
    base.startsWith('.')
  );
}

async function bytesDe(arquivo: File): Promise<Uint8Array> {
  return new Uint8Array(await arquivo.arrayBuffer());
}

/**
 * Lê no navegador os arquivos escolhidos (.zip, .docx e .pdf soltos) e monta
 * um item por .docx, já com o PDF de mesmo nome. Um arquivo ruim vira item
 * "recusado" com o motivo; nunca interrompe a leitura dos outros.
 */
export async function prepararLote(
  arquivos: File[],
  idInicial = 1
): Promise<LotePreparado> {
  const brutos: Bruto[] = [];
  const errosZip: string[] = [];
  let ignorados = 0;

  for (const arquivo of arquivos) {
    if (/\.zip$/i.test(arquivo.name)) {
      if (arquivo.size > LIMITE_ZIP) {
        errosZip.push(`${arquivo.name}: maior que 300 MB.`);
        continue;
      }
      try {
        for (const e of listarZip(await bytesDe(arquivo))) {
          if (!ehLixo(e.nome))
            brutos.push({ nome: e.nome, tamanho: e.tamanho, bytes: e.ler });
        }
      } catch (erro) {
        errosZip.push(`${arquivo.name}: ${(erro as Error).message}`);
      }
    } else if (!ehLixo(arquivo.name)) {
      brutos.push({
        nome: arquivo.name,
        tamanho: arquivo.size,
        bytes: () => bytesDe(arquivo),
      });
    }
  }

  const pdfs = new Map<string, Bruto>();
  const docxs: Bruto[] = [];
  for (const b of brutos) {
    if (/\.pdf$/i.test(b.nome)) pdfs.set(chaveDoArquivo(b.nome), b);
    else if (/\.docx$/i.test(b.nome)) docxs.push(b);
    else ignorados++;
  }

  let id = idInicial;
  const itens: ItemLote[] = [];
  const usados = new Set<string>();

  for (const docx of docxs) {
    const item: ItemLote = {
      id: id++,
      arquivo: nomeLegivel(docx.nome),
      suspeitas: [],
      avisos: [],
      selecionado: false,
      estado: 'aguardando',
    };
    itens.push(item);

    const chave = chaveDoArquivo(docx.nome);
    const pdf = pdfs.get(chave);
    if (pdf) usados.add(chave);

    try {
      if (docx.tamanho > LIMITE_DOCX)
        throw new Error('Arquivo .docx maior que 20 MB.');
      const leitura = lerResumo(await lerLinhasDocx(await docx.bytes()));
      item.suspeitas.push(...leitura.suspeitas);
      item.avisos.push(...leitura.avisos);
      if (leitura.recusa || !leitura.dados) {
        item.recusa = leitura.recusa ?? 'Não foi possível ler o resumo.';
        continue;
      }
      item.dados = leitura.dados;
    } catch (erro) {
      item.recusa =
        (erro as Error).message || 'Não foi possível ler o arquivo.';
      continue;
    }

    if (!pdf) {
      item.avisos.push('Sem PDF com o mesmo nome.');
    } else if (pdf.tamanho > LIMITE_PDF) {
      item.avisos.push('PDF maior que 15 MB; será importado sem PDF.');
    } else {
      try {
        const bytes = await pdf.bytes();
        item.pdf = new File([bytes as BlobPart], nomeLegivel(pdf.nome), {
          type: 'application/pdf',
        });
      } catch (erro) {
        item.avisos.push(
          `PDF ilegível (${(erro as Error).message}); será importado sem PDF.`
        );
      }
    }
  }

  // PDFs sem .docx: o resumo só sai do .docx.
  for (const [chave, pdf] of pdfs) {
    if (usados.has(chave)) continue;
    itens.push({
      id: id++,
      arquivo: nomeLegivel(pdf.nome),
      recusa: 'Só há o PDF; o resumo é lido do .docx com o mesmo nome.',
      suspeitas: [],
      avisos: [],
      selecionado: false,
      estado: 'aguardando',
    });
  }

  // Títulos repetidos dentro do próprio lote: só o primeiro vem marcado.
  const vistos = new Set<string>();
  for (const item of itens) {
    if (!item.dados) continue;
    const t = chaveDoTitulo(item.dados.titulo);
    if (vistos.has(t))
      item.suspeitas.push('Mesmo título de outro arquivo deste lote.');
    vistos.add(t);
  }

  for (const item of itens) {
    item.selecionado = !item.recusa && item.suspeitas.length === 0;
  }

  itens.sort((a, b) => {
    if (!!a.recusa !== !!b.recusa) return a.recusa ? 1 : -1;
    const ta = a.dados?.titulo ?? a.arquivo;
    const tb = b.dados?.titulo ?? b.arquivo;
    return ta.localeCompare(tb, 'pt-BR', { sensitivity: 'base' });
  });

  return { itens, ignorados, errosZip };
}
