import { up } from './010_remove_test_laboratorio';

describe('migration 010_remove_test_laboratorio', () => {
  it('remove definitivamente laboratórios de teste (ex: "Laboratório de Física (teste)") da base', async () => {
    const raw = jest.fn().mockResolvedValue(undefined);
    const knex = { raw } as any;

    await up(knex);

    expect(raw).toHaveBeenCalledTimes(1);
    const [sql, bindings] = raw.mock.calls[0];

    expect(sql).toContain('DELETE FROM laboratorios');
    expect(sql.toLowerCase()).toContain('ilike');
    expect(bindings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('física'),
        expect.stringContaining('fisica'),
        expect.stringContaining('teste'),
      ])
    );
  });
});
