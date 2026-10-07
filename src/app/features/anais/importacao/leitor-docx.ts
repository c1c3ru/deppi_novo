/**
 * Leitura local (no navegador) de arquivos .zip e .docx, sem biblioteca
 * externa: o .docx é um zip com o texto em word/document.xml. Usa só APIs do
 * navegador (DataView, DecompressionStream e DOMParser), então nada sai do
 * computador de quem está importando.
 */

export interface EntradaZip {
  nome: string;
  tamanho: number;
  ler(): Promise<Uint8Array>;
}

/** Teto de tamanho descompactado de cada arquivo (protege contra zip-bomba). */
export const LIMITE_DESCOMPACTADO = 60 * 1024 * 1024;

const ASSINATURA_FIM = 0x06054b50;
const ASSINATURA_CENTRAL = 0x02014b50;
const ASSINATURA_LOCAL = 0x04034b50;

/** Lista as entradas de um zip (só método "stored" e "deflate", sem zip64). */
export function listarZip(bytes: Uint8Array): EntradaZip[] {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let fim = -1;
  const minimo = Math.max(0, bytes.length - 22 - 0xffff);
  for (let i = bytes.length - 22; i >= minimo; i--) {
    if (dv.getUint32(i, true) === ASSINATURA_FIM) {
      fim = i;
      break;
    }
  }
  if (fim < 0) throw new Error('Arquivo não é um zip válido.');

  const total = dv.getUint16(fim + 10, true);
  let pos = dv.getUint32(fim + 16, true);
  if (pos === 0xffffffff) throw new Error('Zip muito grande (zip64).');

  const entradas: EntradaZip[] = [];
  for (let n = 0; n < total; n++) {
    if (
      pos + 46 > bytes.length ||
      dv.getUint32(pos, true) !== ASSINATURA_CENTRAL
    ) {
      throw new Error('Índice do zip corrompido.');
    }
    const flags = dv.getUint16(pos + 8, true);
    const metodo = dv.getUint16(pos + 10, true);
    const compactado = dv.getUint32(pos + 20, true);
    const tamanho = dv.getUint32(pos + 24, true);
    const nomeLen = dv.getUint16(pos + 28, true);
    const extraLen = dv.getUint16(pos + 30, true);
    const comentarioLen = dv.getUint16(pos + 32, true);
    const local = dv.getUint32(pos + 42, true);
    const nomeBytes = bytes.subarray(pos + 46, pos + 46 + nomeLen);
    // Bit 11: nome em UTF-8. Sem ele, latin1 é a aproximação mais segura.
    const nome = new TextDecoder(flags & 0x800 ? 'utf-8' : 'latin1').decode(
      nomeBytes
    );
    pos += 46 + nomeLen + extraLen + comentarioLen;

    if (nome.endsWith('/')) continue; // pasta
    entradas.push({
      nome,
      tamanho,
      ler: () =>
        lerEntrada(bytes, dv, local, metodo, compactado, tamanho, flags),
    });
  }
  return entradas;
}

async function lerEntrada(
  bytes: Uint8Array,
  dv: DataView,
  local: number,
  metodo: number,
  compactado: number,
  tamanho: number,
  flags: number
): Promise<Uint8Array> {
  if (flags & 0x1) throw new Error('Arquivo protegido por senha.');
  if (tamanho > LIMITE_DESCOMPACTADO) throw new Error('Arquivo grande demais.');
  if (
    local + 30 > bytes.length ||
    dv.getUint32(local, true) !== ASSINATURA_LOCAL
  ) {
    throw new Error('Arquivo corrompido dentro do zip.');
  }
  const inicio =
    local +
    30 +
    dv.getUint16(local + 26, true) +
    dv.getUint16(local + 28, true);
  const dados = bytes.subarray(inicio, inicio + compactado);
  if (metodo === 0) return dados;
  if (metodo !== 8) throw new Error('Compressão do zip não suportada.');
  return descompactar(dados);
}

async function descompactar(dados: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error(
      'Navegador sem suporte a descompactação; use Chrome, Edge ou Firefox atualizados.'
    );
  }
  const fluxo = new Blob([dados as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  const leitor = fluxo.getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    total += value.length;
    if (total > LIMITE_DESCOMPACTADO) {
      await leitor.cancel();
      throw new Error('Arquivo grande demais depois de descompactado.');
    }
    partes.push(value);
  }
  const saida = new Uint8Array(total);
  let pos = 0;
  for (const p of partes) {
    saida.set(p, pos);
    pos += p.length;
  }
  return saida;
}

const NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const SOBRESCRITO: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

/**
 * Linhas de texto do documento, na ordem. Quebras de linha manuais (Shift+Enter)
 * viram linhas separadas e números sobrescritos viram ¹ ² ³, como no Word.
 */
export function linhasDoDocumentoXml(xml: string): string[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Texto do .docx ilegível.');
  }
  const linhas: string[] = [];
  const paragrafos = doc.getElementsByTagNameNS(NS_W, 'p');
  for (let i = 0; i < paragrafos.length; i++) {
    let texto = '';
    const runs = paragrafos[i].getElementsByTagNameNS(NS_W, 'r');
    for (let j = 0; j < runs.length; j++) {
      const run = runs[j];
      const alinhamento = run
        .getElementsByTagNameNS(NS_W, 'vertAlign')[0]
        ?.getAttributeNS(NS_W, 'val');
      const sobrescrito = alinhamento === 'superscript';
      for (let k = 0; k < run.childNodes.length; k++) {
        const no = run.childNodes[k] as Element;
        if (no.namespaceURI !== NS_W) continue;
        if (no.localName === 't') {
          const t = no.textContent ?? '';
          texto += sobrescrito ? t.replace(/\d/g, (d) => SOBRESCRITO[d]) : t;
        } else if (no.localName === 'tab') {
          texto += ' ';
        } else if (no.localName === 'br' || no.localName === 'cr') {
          texto += '\n';
        }
      }
    }
    for (const linha of texto.split('\n')) {
      const limpa = linha.replace(/[\s ]+/g, ' ').trim();
      if (limpa) linhas.push(limpa);
    }
  }
  return linhas;
}

/** Lê um .docx (bytes) e devolve as linhas de texto. */
export async function lerLinhasDocx(bytes: Uint8Array): Promise<string[]> {
  let entradas: EntradaZip[];
  try {
    entradas = listarZip(bytes);
  } catch {
    throw new Error(
      'Não é um .docx válido (salve de novo no Word como .docx).'
    );
  }
  const documento = entradas.find((e) => e.nome === 'word/document.xml');
  if (!documento)
    throw new Error('O .docx não tem o texto principal (word/document.xml).');
  const xml = new TextDecoder('utf-8').decode(await documento.ler());
  return linhasDoDocumentoXml(xml);
}
