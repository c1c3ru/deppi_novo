import { down, up } from './013_add_edital_url_to_revista_edicoes';

describe('migration 013_add_edital_url_to_revista_edicoes', () => {
  function mockKnex() {
    const table = { string: jest.fn(), dropColumn: jest.fn() };
    const alterTable = jest.fn((_name: string, cb: (t: any) => void) => {
      cb(table);
      return Promise.resolve();
    });
    return { knex: { schema: { alterTable } } as any, table, alterTable };
  }

  it('adiciona a coluna edital_url (opcional) em revista_edicoes', async () => {
    const { knex, table, alterTable } = mockKnex();
    await up(knex);
    expect(alterTable).toHaveBeenCalledWith('revista_edicoes', expect.any(Function));
    expect(table.string).toHaveBeenCalledWith('edital_url', 1000);
  });

  it('remove a coluna no rollback', async () => {
    const { knex, table } = mockKnex();
    await down(knex);
    expect(table.dropColumn).toHaveBeenCalledWith('edital_url');
  });
});
