/**
 * Extração dos campos de um resumo da submissão (SIC) a partir das linhas do
 * .docx. Padrão anotado nos arquivos recebidos, em ordem:
 *   TÍTULO EM CAIXA ALTA (1 a 3 linhas)
 *   Autores: SOBRENOME, Nome¹; SOBRENOME, Nome²
 *   ¹ Instituição (uma por linha, às vezes ausente)
 *   RESUMO (rótulo opcional)
 *   Texto corrido (Introdução / Objetivo / ... ou sem rótulos)
 *   Palavras-chave: a; b; c
 * Funções puras, sem Angular, para poderem ser testadas isoladamente.
 */

export interface ResumoExtraido {
  titulo: string;
  autores: string;
  instituicoes: string[];
  resumo: string;
  palavrasChave: string[];
}

export interface ResultadoLeitura {
  dados?: ResumoExtraido;
  /** Arquivo inaproveitável: não pode ser importado. */
  recusa?: string;
  /** Problema grave: o item vem desmarcado. */
  suspeitas: string[];
  /** Detalhe a conferir: o item vem marcado. */
  avisos: string[];
}

const MARCAS = /[⁰¹²³⁴⁵⁶⁷⁸⁹*]/g;
const ROTULO_AUTOR =
  /^(?:autor(?:es|as|a)?|orientador(?:es|a|as)?|coorientador(?:es|a|as)?)\s*:\s*/i;
const ROTULO_PALAVRAS = /^palavras?[\s\-–]*chaves?\s*[:\-–—]\s*/i;
const ROTULO_RESUMO = /^resumo(?:\s+simples)?\s*[:.\-–]?\s*/i;
const SECAO_TEXTO =
  /^(introdu[cç][aã]o|objetivos?|metodologia|resultados|conclus[aã]o|considera[cç][oõ]es)\b/i;
const PALAVRAS_INSTITUICAO =
  /\b(instituto|universidade|escola|faculdade|programa|curso|campus|docente|discente|orientador|orientadora|ifce|centro|departamento|eixo|n[uú]cleo|secretaria|mestrado|doutorado|gradua[cç][aã]o)\b/i;

/** Frases típicas de resposta de IA coladas por engano no lugar do resumo. */
const SINAIS_DE_IA: RegExp[] = [
  /texto original j[aá] est[aá]/i,
  /vers[aã]o (corrigida|revisada|aprimorada)/i,
  /^texto (corrigido|revisado)\b/i,
  /segue (a|abaixo|uma) (vers[aã]o|revis[aã]o|sugest[aã]o)/i,
  /\b(aqui est[aá]|apresento a seguir|a seguir,? apresento)\b/i,
  /como (um )?modelo de linguagem/i,
  /\b(chatgpt|gpt-\d|gemini|copilot)\b/i,
  /detalhamento das (pequenas )?(altera[cç][oõ]es|corre[cç][oõ]es|mudan[cç]as)/i,
  /principais (altera[cç][oõ]es|corre[cç][oõ]es) (realizadas|feitas)/i,
];

function letras(texto: string): string {
  return texto.replace(/[^\p{L}]/gu, '');
}

/** Linha "em caixa alta": pelo menos 80% das letras maiúsculas. */
export function emCaixaAlta(linha: string): boolean {
  const l = letras(linha);
  if (l.length < 3) return false;
  const maiusculas = l.replace(/[^\p{Lu}]/gu, '').length;
  return maiusculas / l.length >= 0.8;
}

function ehLinhaDeAutores(linha: string): boolean {
  if (ROTULO_AUTOR.test(linha)) return true;
  // "SOBRENOME, Nome" logo no começo (com marcas opcionais antes).
  return /^[⁰¹²³⁴⁵⁶⁷⁸⁹\s]*[\p{Lu}][\p{Lu}'\- ]+[⁰¹²³⁴⁵⁶⁷⁸⁹]*\s*[,;]\s*[⁰¹²³⁴⁵⁶⁷⁸⁹]*\p{Lu}\p{Ll}/u.test(
    linha
  );
}

function ehLinhaDeInstituicao(linha: string): boolean {
  if (
    linha.length > 400 ||
    SECAO_TEXTO.test(linha) ||
    ROTULO_RESUMO.test(linha)
  ) {
    return false;
  }
  return /^[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(linha) || PALAVRAS_INSTITUICAO.test(linha);
}

const PARTICULAS = new Set([
  'da',
  'de',
  'do',
  'das',
  'dos',
  'e',
  'di',
  'du',
  'van',
  'von',
]);

function capitalizar(palavra: string): string {
  return palavra
    .split('-')
    .map((p) =>
      p
        ? p[0].toLocaleUpperCase('pt-BR') +
          p.slice(1).toLocaleLowerCase('pt-BR')
        : p
    )
    .join('-');
}

/** "DA SILVA" → "da Silva"; "LIMA FILHO" → "Lima Filho". Mantém o que já está misto. */
function sobrenomeLegivel(sobrenome: string): string {
  if (!emCaixaAlta(sobrenome)) return sobrenome;
  return sobrenome
    .split(/\s+/)
    .map((p) =>
      PARTICULAS.has(p.toLowerCase()) ? p.toLowerCase() : capitalizar(p)
    )
    .join(' ');
}

function limparPedaco(texto: string): string {
  return (
    texto
      .replace(MARCAS, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^[\s.,;:]+/, '')
      .replace(/[\s,;:]+$/, '')
      // Mantém o ponto de uma abreviação ("Bianca C."), tira o ponto final.
      .replace(/(?<!\b\p{Lu})\.+$/u, '')
      .trim()
  );
}

function montarNome(sobrenome: string, prenomes: string): string {
  const s = sobrenomeLegivel(limparPedaco(sobrenome));
  const p = limparPedaco(prenomes);
  return [p, s].filter(Boolean).join(' ');
}

/**
 * Converte a linha de autores ("SOBRENOME, Nome¹; SOBRENOME, Nome²") para
 * "Nome Sobrenome; Nome Sobrenome", que é como os anais exibem e citam.
 */
export function formatarAutores(linhas: string[]): string {
  const nomes: string[] = [];
  for (const bruta of linhas) {
    const linha = bruta.replace(ROTULO_AUTOR, '');
    const pedacos = linha
      .split(';')
      .map((p) => p.trim())
      .filter((p) => limparPedaco(p));

    // Sem ";" e com várias vírgulas: autores separados por vírgula.
    if (pedacos.length === 1 && (linha.match(/,/g) ?? []).length >= 2) {
      const partes = linha.split(',').map(limparPedaco).filter(Boolean);
      for (let i = 0; i < partes.length; i++) {
        if (
          emCaixaAlta(partes[i]) &&
          partes[i + 1] &&
          !emCaixaAlta(partes[i + 1])
        ) {
          nomes.push(montarNome(partes[i], partes[i + 1]));
          i++;
        } else {
          nomes.push(montarNome('', partes[i]));
        }
      }
      continue;
    }

    for (let i = 0; i < pedacos.length; i++) {
      const pedaco = pedacos[i];
      const virgula = pedaco.indexOf(',');
      if (virgula >= 0) {
        nomes.push(
          montarNome(pedaco.slice(0, virgula), pedaco.slice(virgula + 1))
        );
        continue;
      }
      const proximo = pedacos[i + 1];
      // "SOUZA; David Carneiro de" — ponto e vírgula no lugar da vírgula.
      if (
        emCaixaAlta(pedaco) &&
        proximo &&
        !proximo.includes(',') &&
        !emCaixaAlta(proximo)
      ) {
        nomes.push(montarNome(pedaco, proximo));
        i++;
        continue;
      }
      nomes.push(montarNome('', pedaco));
    }
  }
  return nomes.filter(Boolean).join('; ');
}

export function extrairPalavrasChave(linha: string): string[] {
  return linha
    .replace(ROTULO_PALAVRAS, '')
    .split(/[;,]/)
    .map((p) =>
      p
        .replace(/\s+/g, ' ')
        .replace(/^[\s.]+|[\s.]+$/g, '')
        .trim()
    )
    .filter(Boolean);
}

/** Título comparável: sem acentos, pontuação e diferença de caixa/espaços. */
export function chaveDoTitulo(titulo: string | null | undefined): string {
  return (titulo ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function lerResumo(linhas: string[]): ResultadoLeitura {
  const suspeitas: string[] = [];
  const avisos: string[] = [];
  const texto = linhas.map((l) => l.trim()).filter(Boolean);
  if (texto.length === 0)
    return { recusa: 'Documento vazio.', suspeitas, avisos };

  let i = 0;

  // 1. Título
  const tituloLinhas: string[] = [];
  while (
    i < texto.length &&
    tituloLinhas.length < 4 &&
    emCaixaAlta(texto[i]) &&
    !ehLinhaDeAutores(texto[i])
  ) {
    tituloLinhas.push(texto[i]);
    i++;
  }
  if (tituloLinhas.length === 0) {
    tituloLinhas.push(texto[0]);
    i = 1;
    suspeitas.push(
      'Título fora do padrão (a primeira linha não está em caixa alta).'
    );
  }
  const titulo = tituloLinhas
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/[\s/,;.]+$/, '')
    .trim();

  // 2. Autores (inclui linhas "Orientador: ...")
  const autoresLinhas: string[] = [];
  const restoInstituicao: string[] = [];
  while (i < texto.length && ehLinhaDeAutores(texto[i])) {
    let linha = texto[i];
    // Instituição colada no fim da linha de autores: "...Matos²¹Instituto Federal..."
    const colada =
      /[⁰¹²³⁴⁵⁶⁷⁸⁹](?=(?:Instituto|Universidade|Escola|Faculdade|Programa)\b)/u.exec(
        linha
      );
    if (colada && colada.index > 0) {
      restoInstituicao.push(linha.slice(colada.index).trim());
      linha = linha.slice(0, colada.index);
    }
    autoresLinhas.push(linha);
    i++;
  }
  const autores = formatarAutores(autoresLinhas);
  if (!autores)
    suspeitas.push(
      'Autores não encontrados (esperado "Autores: SOBRENOME, Nome¹; ...").'
    );

  // 3. Instituições
  const instituicoes: string[] = [...restoInstituicao];
  while (i < texto.length && ehLinhaDeInstituicao(texto[i])) {
    const anterior = instituicoes.length - 1;
    // Linha quebrada no meio ("..., Campus de" / "Maracanaú. Eixo ...").
    if (
      anterior >= 0 &&
      !/^[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(texto[i]) &&
      !/[.;:]$/.test(instituicoes[anterior])
    ) {
      instituicoes[anterior] += ' ' + texto[i];
    } else {
      instituicoes.push(texto[i]);
    }
    i++;
  }
  if (instituicoes.length === 0) avisos.push('Sem instituições.');

  // 4. Rótulo RESUMO (opcional; às vezes com o texto na mesma linha)
  if (i < texto.length && ROTULO_RESUMO.test(texto[i])) {
    const resto = texto[i].replace(ROTULO_RESUMO, '').trim();
    if (resto) texto[i] = resto;
    else i++;
  }

  // 5. Texto corrido até "Palavras-chave"
  const corpo: string[] = [];
  let palavrasChave: string[] = [];
  let depois = 0;
  for (; i < texto.length; i++) {
    if (ROTULO_PALAVRAS.test(texto[i])) {
      palavrasChave = extrairPalavrasChave(texto[i]);
      depois = texto.length - i - 1;
      break;
    }
    corpo.push(texto[i]);
  }
  if (palavrasChave.length === 0) avisos.push('Sem palavras-chave.');
  if (depois > 0) {
    avisos.push(
      `${depois} ${depois === 1 ? 'linha depois' : 'linhas depois'} das palavras-chave ${depois === 1 ? 'ficou' : 'ficaram'} de fora.`
    );
  }

  const resumo = corpo.join('\n').trim();
  if (resumo.length < 100) {
    return {
      recusa: 'Texto do resumo não encontrado ou curto demais.',
      suspeitas,
      avisos,
    };
  }
  if (resumo.length < 400)
    suspeitas.push('Resumo muito curto; confira se o texto veio inteiro.');

  const sinal = corpo.find((l) => SINAIS_DE_IA.some((r) => r.test(l)));
  if (sinal) {
    suspeitas.push(
      `Parece haver texto de IA colado no resumo: "${sinal.slice(0, 90)}${sinal.length > 90 ? '…' : ''}"`
    );
  }

  return {
    dados: { titulo, autores, instituicoes, resumo, palavrasChave },
    suspeitas,
    avisos,
  };
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Conteúdo HTML do trabalho: instituições, palavras-chave e link do PDF. */
export function montarConteudo(
  dados: ResumoExtraido,
  pdfUrl?: string | null
): string {
  const partes: string[] = [];
  if (dados.instituicoes.length > 0) {
    partes.push('<p><strong>Instituições</strong></p>');
    for (const inst of dados.instituicoes)
      partes.push(`<p>${escaparHtml(inst)}</p>`);
  }
  if (dados.palavrasChave.length > 0) {
    partes.push(
      `<p><strong>Palavras-chave:</strong> ${escaparHtml(dados.palavrasChave.join('; '))}.</p>`
    );
  }
  if (pdfUrl && /^\/uploads\/[\w.-]+\.pdf$/i.test(pdfUrl)) {
    partes.push(`<p><a href="${escaparHtml(pdfUrl)}">PDF do trabalho</a></p>`);
  }
  // O backend exige conteúdo; sem nada acima, repete o resumo.
  if (partes.length === 0) partes.push(`<p>${escaparHtml(dados.resumo)}</p>`);
  return partes.join('');
}

/**
 * Nome do arquivo para casar o .docx com o .pdf: aceita "nome.docx.pdf",
 * "nome.pdf" e "nome..pdf". O Google Drive grava acentos como "#U00e3".
 */
export function nomeLegivel(nome: string): string {
  const base = nome.split('/').pop() ?? nome;
  return base.replace(/#U([0-9a-f]{4})/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

export function chaveDoArquivo(nome: string): string {
  return nomeLegivel(nome)
    .replace(/\.pdf$/i, '')
    .replace(/\.docx$/i, '')
    .replace(/[\s.]+$/, '')
    .normalize('NFC')
    .toLowerCase();
}

function celulaCsv(valor: string | number | null | undefined): string {
  let texto = String(valor ?? '');
  // Evita que planilhas interpretem a célula como fórmula.
  if (/^[=+\-@]/.test(texto)) texto = `'${texto}`;
  return `"${texto.replace(/"/g, '""')}"`;
}

export function gerarCsv(
  cabecalho: string[],
  linhas: (string | number | null | undefined)[][]
): string {
  return (
    '﻿' +
    [cabecalho, ...linhas].map((l) => l.map(celulaCsv).join(';')).join('\r\n')
  );
}
