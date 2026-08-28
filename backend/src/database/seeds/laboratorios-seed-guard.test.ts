import * as fs from 'fs';
import * as path from 'path';

// Impede a reintrodução acidental do laboratório de teste ("Laboratório de
// Física (teste)") no seed de laboratórios.
describe('seed de laboratorios — ausência de dados de teste', () => {
  it('002_seed_laboratorios.ts não contém laboratórios de teste ("física" + "teste")', () => {
    const content = fs
      .readFileSync(path.join(__dirname, '002_seed_laboratorios.ts'), 'utf-8')
      .toLowerCase();

    const containsFisica =
      content.includes('física') || content.includes('fisica');
    const containsTeste = content.includes('teste');

    expect(containsFisica && containsTeste).toBe(false);
  });
});
