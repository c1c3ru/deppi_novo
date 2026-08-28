import { up } from './012_atualiza_descricoes_laboratorios';

function mockQuery() {
  const builder: any = {};
  builder.where = jest.fn(() => builder);
  builder.update = jest.fn(() => Promise.resolve(1));
  return builder;
}

describe('migration 012_atualiza_descricoes_laboratorios', () => {
  it('atualiza nome e descrição dos 6 laboratórios pelo prefixo da sigla', async () => {
    const builders: any[] = [];
    const knex = jest.fn(() => {
      const builder = mockQuery();
      builders.push(builder);
      return builder;
    }) as any;

    await up(knex);

    expect(knex).toHaveBeenCalledTimes(6);
    expect(knex).toHaveBeenCalledWith('laboratorios');

    const siglasEsperadas = ['LAQAMB', 'LAPP', 'MAKER', 'OFICINA', 'LQOI', 'LASIC'];
    siglasEsperadas.forEach((sigla, i) => {
      expect(builders[i].where).toHaveBeenCalledWith('name', 'like', `${sigla} - %`);
      expect(builders[i].update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining(sigla),
          description: expect.not.stringContaining('placeholder'),
        })
      );
    });
  });

  it('corrige o nome por extenso do LAPP para "Apoio às Práticas Pedagógicas"', async () => {
    let lappUpdatePayload: any;
    const knex = jest.fn((_table: string) => {
      const builder = mockQuery();
      builder.update = jest.fn((payload: any) => {
        if (payload.name.startsWith('LAPP')) {
          lappUpdatePayload = payload;
        }
        return Promise.resolve(1);
      });
      return builder;
    }) as any;

    await up(knex);

    expect(lappUpdatePayload.name).toBe(
      'LAPP - Laboratório de Apoio às Práticas Pedagógicas'
    );
  });
});
