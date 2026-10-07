import { linhasDoDocumentoXml, lerLinhasDocx, listarZip } from './leitor-docx';
import { prepararLote } from './preparar-lote';

const W =
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

function documentoXml(corpo: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><w:document ${W}><w:body>${corpo}</w:body></w:document>`;
}

function p(...runs: string[]): string {
  return `<w:p>${runs.join('')}</w:p>`;
}
function r(texto: string, sobrescrito = false): string {
  const rpr = sobrescrito
    ? '<w:rPr><w:vertAlign w:val="superscript"/></w:rPr>'
    : '';
  return `<w:r>${rpr}<w:t xml:space="preserve">${texto}</w:t></w:r>`;
}

/** Zip mínimo (método "stored"), suficiente para testar a leitura. */
function zip(arquivos: Record<string, string | Uint8Array>): Uint8Array {
  const enc = new TextEncoder();
  const locais: number[] = [];
  const central: number[] = [];
  let offset = 0;
  const u16 = (n: number) => [n & 0xff, (n >> 8) & 0xff];
  const u32 = (n: number) => [
    n & 0xff,
    (n >> 8) & 0xff,
    (n >> 16) & 0xff,
    (n >>> 24) & 0xff,
  ];
  const nomes = Object.keys(arquivos);
  for (const nome of nomes) {
    const v = arquivos[nome];
    const dados = typeof v === 'string' ? enc.encode(v) : v;
    const n = enc.encode(nome);
    const local = [
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0x800),
      ...u16(0),
      ...u32(0),
      ...u32(0),
      ...u32(dados.length),
      ...u32(dados.length),
      ...u16(n.length),
      ...u16(0),
      ...n,
      ...dados,
    ];
    central.push(
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0x800),
      ...u16(0),
      ...u32(0),
      ...u32(0),
      ...u32(dados.length),
      ...u32(dados.length),
      ...u16(n.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
      ...n
    );
    locais.push(...local);
    offset += local.length;
  }
  const fim = [
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(nomes.length),
    ...u16(nomes.length),
    ...u32(central.length),
    ...u32(offset),
    ...u16(0),
  ];
  return new Uint8Array([...locais, ...central, ...fim]);
}

const RESUMO =
  'Introdução: trabalho de extensão com estudantes. Metodologia: oficinas semanais com registro ' +
  'em diário de campo. Resultados: maior participação e melhora nas notas da turma. Conclusão: a ' +
  'proposta será mantida no próximo semestre com novas escolas parceiras da região metropolitana. ' +
  'Os dados foram organizados em planilhas e discutidos com a equipe em encontros quinzenais.';

const RESUMO_LONGO = `${RESUMO} ${RESUMO}`;

function docx(titulo: string): Uint8Array {
  return zip({
    '[Content_Types].xml': '<Types/>',
    'word/document.xml': documentoXml(
      p(r(titulo)) +
        p(
          r('Autores: SILVA, Ana'),
          r('1', true),
          r('; COSTA, Bia'),
          r('2', true)
        ) +
        p(
          r('1', true),
          r('Instituto Federal do Ceará'),
          '<w:r><w:br/></w:r>',
          r('2', true),
          r('Universidade Federal')
        ) +
        p(r('RESUMO')) +
        p(r(RESUMO_LONGO)) +
        p(r('Palavras-chave: a; b'))
    ),
  });
}

describe('leitor-docx', () => {
  it('lê parágrafos, quebras de linha e números sobrescritos', () => {
    const linhas = linhasDoDocumentoXml(
      documentoXml(
        p(r('TÍTULO  DO TRABALHO')) +
          p(
            r('SILVA, Ana'),
            r('1', true),
            '<w:r><w:br/></w:r>',
            r('2', true),
            r('Instituto')
          ) +
          p(r('   '))
      )
    );
    expect(linhas).toEqual(['TÍTULO DO TRABALHO', 'SILVA, Ana¹', '²Instituto']);
  });

  it('lista um zip e lê um .docx de dentro dele', async () => {
    const bytes = docx('TÍTULO DE TESTE');
    expect(listarZip(bytes).map((e) => e.nome)).toEqual([
      '[Content_Types].xml',
      'word/document.xml',
    ]);
    const linhas = await lerLinhasDocx(bytes);
    expect(linhas[0]).toBe('TÍTULO DE TESTE');
    expect(linhas[1]).toBe('Autores: SILVA, Ana¹; COSTA, Bia²');
  });

  it('descompacta entradas "deflate" com a API do navegador', async () => {
    const original = new TextEncoder().encode(documentoXml(p(r('OLÁ'))));
    const comprimido = new Uint8Array(
      await new Response(
        new Blob([original])
          .stream()
          .pipeThrough(new CompressionStream('deflate-raw'))
      ).arrayBuffer()
    );
    const bytes = zip({ 'word/document.xml': comprimido });
    // Ajusta o método para 8 (deflate) e o tamanho descompactado no índice.
    const dv = new DataView(bytes.buffer);
    const central = bytes.length - 22 - (46 + 'word/document.xml'.length);
    dv.setUint16(8, 8, true);
    dv.setUint16(central + 10, 8, true);
    dv.setUint32(central + 24, original.length, true);
    expect(await lerLinhasDocx(bytes)).toEqual(['OLÁ']);
  });

  it('recusa arquivo que não é .docx', async () => {
    await expectAsync(
      lerLinhasDocx(new TextEncoder().encode('não é zip'))
    ).toBeRejectedWithError(/docx válido/);
  });

  it('prepara o lote: casa PDFs, recusa arquivos ruins e desmarca suspeitos', async () => {
    const pacote = zip({
      'SUBMISSAO/Ana-Resumo simples.docx': docx('BETA'),
      'SUBMISSAO/Ana-Resumo simples.docx.pdf': '%PDF-1.4',
      'SUBMISSAO/Bia-Resumo simples.docx': docx('ALFA'),
      'SUBMISSAO/Caio-Resumo simples.docx': 'corrompido',
      'SUBMISSAO/Duda-Resumo simples.pdf': '%PDF-1.4',
      'SUBMISSAO/Eva-Resumo simples.docx': docx('ALFA'),
      'SUBMISSAO/foto.png': 'x',
      '__MACOSX/._lixo.docx': 'x',
    });
    const lote = await prepararLote([
      new File([pacote as BlobPart], 'resumos.zip'),
    ]);
    expect(lote.ignorados).toBe(1);
    const porArquivo = Object.fromEntries(
      lote.itens.map((i) => [i.arquivo, i])
    );

    expect(porArquivo['Ana-Resumo simples.docx'].pdf?.name).toBe(
      'Ana-Resumo simples.docx.pdf'
    );
    expect(porArquivo['Ana-Resumo simples.docx'].selecionado).toBeTrue();
    expect(porArquivo['Bia-Resumo simples.docx'].avisos).toContain(
      'Sem PDF com o mesmo nome.'
    );
    expect(porArquivo['Bia-Resumo simples.docx'].selecionado).toBeTrue();
    expect(porArquivo['Caio-Resumo simples.docx'].recusa).toBeTruthy();
    expect(porArquivo['Duda-Resumo simples.pdf'].recusa).toContain(
      'Só há o PDF'
    );
    expect(porArquivo['Eva-Resumo simples.docx'].selecionado).toBeFalse();
    expect(porArquivo['Eva-Resumo simples.docx'].suspeitas).toContain(
      'Mesmo título de outro arquivo deste lote.'
    );
    // Ordem alfabética por título, recusados no fim.
    expect(lote.itens.map((i) => i.dados?.titulo ?? 'recusado')).toEqual([
      'ALFA',
      'ALFA',
      'BETA',
      'recusado',
      'recusado',
    ]);
  });
});
