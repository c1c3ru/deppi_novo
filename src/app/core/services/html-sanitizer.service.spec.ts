import { TestBed } from '@angular/core/testing';

import { HtmlSanitizerService } from './html-sanitizer.service';

describe('HtmlSanitizerService', () => {
  let service: HtmlSanitizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmlSanitizerService);
  });

  it('remove <script> mantendo o texto ao redor', () => {
    expect(service.clean('<p>Boletim</p><script>alert(1)</script>')).toBe(
      '<p>Boletim</p>'
    );
  });

  it('remove handlers inline como onerror', () => {
    const result = service.clean('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
    expect(result).toContain('<img');
  });

  it('remove href com javascript:', () => {
    expect(service.clean('<a href="javascript:alert(1)">x</a>')).not.toContain(
      'javascript:'
    );
  });

  it('derruba o src de iframe de host não confiável', () => {
    const result = service.clean(
      '<iframe src="https://evil.example/x"></iframe>'
    );
    expect(result).not.toContain('evil.example');
  });

  it('mantém vídeo embutido do YouTube', () => {
    const result = service.clean(
      '<iframe class="ql-video" src="https://www.youtube.com/embed/abc"></iframe>'
    );
    expect(result).toContain('https://www.youtube.com/embed/abc');
  });

  it('preserva a formatação que a barra do Quill gera', () => {
    const result = service.clean(
      '<h2>Título</h2><p><strong>negrito</strong></p>' +
        '<p class="ql-align-center" style="color: rgb(0, 100, 0);">centro</p>' +
        '<ol><li data-list="bullet">item</li></ol><blockquote>citação</blockquote>'
    );

    expect(result).toContain('<h2>Título</h2>');
    expect(result).toContain('<strong>negrito</strong>');
    expect(result).toContain('ql-align-center');
    expect(result).toContain('<blockquote>citação</blockquote>');
  });

  it('devolve null quando não há conteúdo', () => {
    expect(service.sanitizeRichText('')).toBeNull();
    expect(service.sanitizeRichText(null)).toBeNull();
    expect(service.sanitizeRichText(undefined)).toBeNull();
  });

  it('devolve SafeHtml já limpo para o innerHTML', () => {
    const safe = service.sanitizeRichText('<p>ok</p><script>alert(1)</script>');
    expect(safe).not.toBeNull();
    expect(String(safe)).not.toContain('<script>');
  });
});
