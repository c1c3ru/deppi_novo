import { RevistaArtigo, RevistaEdicao } from '../../shared/models';

/** Nome oficial da publicação, usado em cabeçalhos e na citação. */
export const ANAIS_TITULO =
  'Anais da Mostra Científica do IFCE Campus Maracanaú';

/**
 * Dados institucionais aprovados pela Comissão (protótipo "Modelo para
 * implementação pela TI"). Trocar o ISSN só depois da atribuição oficial.
 */
export const ANAIS_INFO = {
  periodicidade: 'Anual',
  formato: 'Eletrônico',
  acesso: 'Aberto',
  idioma: 'Português',
  issn: 'A solicitar',
  contato: 'sic@maracanau.ifce.edu.br',
  coordenacao: 'Luis José Silveira de Sousa',
  revisao: ['Cícero José Sousa da Silva', 'Luiz Carlos Silveira de Sousa'],
  comissao: [
    'Adriana Gonçalves de Sales Costa',
    'Francisco de Assis Francelino Alves',
    'Francisco Jucivanio Felix de Sousa',
    'Heloisa Beatriz Cordeiro Moreira',
    'Juliana de Brito Marques do Nascimento',
    'Kalleu Fernando de Alencar Carvalho',
    'Keyla de Souza Lima Cruz',
    'Luiz Carlos Silveira de Sousa',
    'Maria do Socorro Ribeiro Hortegal Filha',
    'Stenisia Denis Holanda Lavor Gurgel',
  ],
} as const;

/**
 * O banco não tem um campo próprio para o PDF do trabalho. Quando quem edita
 * insere no conteúdo um link para um arquivo .pdf, ele vira o botão "PDF".
 */
export function extrairLinkPdf(
  content: string | null | undefined
): string | null {
  if (!content) return null;
  const regex = /href\s*=\s*["']([^"']+?\.pdf(?:[?#][^"']*)?)["']/i;
  const match = regex.exec(content);
  if (!match) return null;
  const url = match[1].trim();
  // Só aceita http(s) ou caminhos do próprio site (ex.: /uploads/...).
  return /^(https?:\/\/|\/)/i.test(url) ? url : null;
}

/** Texto em minúsculas e sem acentos, para a busca não depender de grafia. */
export function normalizarTexto(texto: string | null | undefined): string {
  return (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function filtrarTrabalhos(
  artigos: RevistaArtigo[],
  termo: string
): RevistaArtigo[] {
  const busca = normalizarTexto(termo).trim();
  if (!busca) return artigos;
  return artigos.filter((a) =>
    [a.title, a.authors, a.summary].some((campo) =>
      normalizarTexto(campo).includes(busca)
    )
  );
}

/** Sugestão de citação no formato usado pelos anais de evento (ABNT simplificada). */
export function sugestaoDeCitacao(
  artigo: RevistaArtigo,
  edicao: RevistaEdicao | null | undefined
): string {
  const autores = (artigo.authors ?? '')
    .split(/[;,]/)
    .map((a) => a.trim())
    .filter(Boolean)
    .map((nome) => {
      const partes = nome.split(/\s+/);
      if (partes.length < 2) return nome.toUpperCase();
      const sobrenome = partes.pop()!.toUpperCase();
      return `${sobrenome}, ${partes.join(' ')}`;
    })
    .join('; ');
  const volume = edicao ? `, v. ${edicao.volume}` : '';
  const ano = edicao ? `, ${edicao.ano}` : '';
  const prefixo = autores ? `${autores}. ` : '';
  return `${prefixo}${artigo.title}. In: ${ANAIS_TITULO}${volume}. Maracanaú: IFCE${ano}.`;
}
