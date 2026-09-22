import sanitizeHtml from 'sanitize-html';

// O conteúdo de boletins e artigos é produzido pelo editor Quill e volta ao
// navegador como HTML confiável (o frontend renderiza com innerHTML). Sem
// limpeza, qualquer `<script>`/`onerror=` gravado por um usuário autenticado
// vira XSS armazenado para todo visitante da página pública — por isso a
// sanitização acontece na escrita (aqui) e também na renderização.
//
// A allowlist abaixo cobre exatamente o que a barra de ferramentas do Quill
// consegue gerar hoje (negrito/itálico/sublinhado, listas, títulos, citação,
// bloco de código, cor/fundo, link, imagem e vídeo) — ver `quillModules` em
// boletim-form.component.ts e artigo-form.component.ts.
const QUILL_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'span',
    'div',
    'hr',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'del',
    'ins',
    'sub',
    'sup',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'code',
    'ol',
    'ul',
    'li',
    'a',
    'img',
    'iframe',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    '*': ['class', 'style', 'data-list'],
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    iframe: [
      'src',
      'width',
      'height',
      'frameborder',
      'allowfullscreen',
      'allow',
    ],
  },
  // Sem 'javascript:' — o padrão da lib já barra, mas deixamos explícito.
  allowedSchemes: ['http', 'https', 'mailto'],
  // Quill embute imagens coladas como data URI base64.
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  // Vídeo do Quill é um iframe; só plataformas conhecidas podem ser embutidas.
  allowedIframeHostnames: [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'player.vimeo.com',
    'vimeo.com',
  ],
  allowedClasses: {
    '*': ['ql-*'],
  },
  allowedStyles: {
    '*': {
      color: [/^.*$/],
      'background-color': [/^.*$/],
      'text-align': [/^(left|right|center|justify)$/],
      width: [/^\d+(?:\.\d+)?(?:px|%|em|rem)$/],
      height: [/^\d+(?:\.\d+)?(?:px|%|em|rem)$/],
    },
  },
  // Links externos não devem dar acesso a window.opener.
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
  },
  disallowedTagsMode: 'discard',
};

// Limpa o HTML do editor. Valores vazios/não-string voltam como estão para
// não transformar `undefined` em string vazia em um PATCH parcial.
export function sanitizeRichText<T>(html: T): T | string {
  if (typeof html !== 'string') return html;
  return sanitizeHtml(html, QUILL_SANITIZE_OPTIONS);
}
