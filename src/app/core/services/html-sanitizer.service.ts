import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

// Conteúdo vindo do editor Quill (boletins e artigos da revista) é renderizado
// com [innerHTML], o que exige `bypassSecurityTrustHtml` e desliga a proteção
// padrão do Angular. Esta camada devolve a proteção: o HTML é limpo pelo
// DOMPurify antes de ser marcado como confiável, então nem conteúdo antigo,
// gravado antes da sanitização no backend, consegue executar script.
//
// A allowlist espelha `backend/src/utils/sanitize.ts` — ambas cobrem o que a
// barra de ferramentas do Quill gera (formatação, listas, títulos, citação,
// bloco de código, cor/fundo, link, imagem e vídeo).
const ALLOWED_TAGS = [
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
];

const ALLOWED_ATTR = [
  'class',
  'style',
  'data-list',
  'href',
  'name',
  'target',
  'rel',
  'title',
  'src',
  'alt',
  'width',
  'height',
  'frameborder',
  'allowfullscreen',
  'allow',
];

const ALLOWED_IFRAME_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
];

@Injectable({
  providedIn: 'root',
})
export class HtmlSanitizerService {
  private readonly sanitizer = inject(DomSanitizer);
  private hookInstalled = false;

  // Limpa o HTML e devolve um SafeHtml pronto para [innerHTML].
  sanitizeRichText(html: string | null | undefined): SafeHtml | null {
    if (!html) return null;
    return this.sanitizer.bypassSecurityTrustHtml(this.clean(html));
  }

  // Limpa o HTML devolvendo string — útil para prévias e testes.
  clean(html: string): string {
    this.installIframeHook();
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      // Quill embute imagens coladas como data URI base64.
      ADD_DATA_URI_TAGS: ['img'],
    });
  }

  // O vídeo do Quill é um <iframe>; só plataformas conhecidas podem ser
  // embutidas, então derrubamos o src de qualquer outro host.
  private installIframeHook(): void {
    if (this.hookInstalled) return;
    DOMPurify.addHook('uponSanitizeElement', (node, data) => {
      if (data.tagName !== 'iframe') return;
      const element = node as Element;
      const src = element.getAttribute?.('src') ?? '';
      let hostname = '';
      try {
        hostname = new URL(src, window.location.origin).hostname;
      } catch {
        hostname = '';
      }
      if (!ALLOWED_IFRAME_HOSTS.includes(hostname)) {
        element.removeAttribute?.('src');
      }
    });
    this.hookInstalled = true;
  }
}
