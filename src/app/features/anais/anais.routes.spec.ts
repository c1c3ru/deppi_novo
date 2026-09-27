import { Routes } from '@angular/router';
import { ANAIS_ROUTES } from './anais.module';

function caminhos(routes: Routes, prefixo = ''): string[] {
  return routes.flatMap((r) => {
    const atual = [prefixo, r.path].filter(Boolean).join('/');
    return [atual, ...caminhos(r.children ?? [], atual)];
  });
}

describe('Rotas dos anais', () => {
  const todas = caminhos(ANAIS_ROUTES);

  it('cobre as páginas do protótipo aprovado', () => {
    for (const p of [
      '',
      'edicao-atual',
      'edicoes',
      'edicoes/:id',
      'artigos/:id',
      'normas',
      'corpo-editorial',
      'expediente',
    ]) {
      expect(todas).toContain(p);
    }
  });

  it('não tem mais nenhum caminho com "revista"', () => {
    expect(todas.some((p) => p.includes('revista'))).toBeFalse();
  });
});
