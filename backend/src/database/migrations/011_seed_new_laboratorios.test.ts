import { up } from './011_seed_new_laboratorios';

function mockQuery(resolveValue: unknown) {
  const builder: any = {};
  const chainableMethods = ['where', 'first', 'insert', 'update', 'whereIn', 'del'];
  chainableMethods.forEach((method) => {
    builder[method] = jest.fn(() => builder);
  });
  builder.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(resolveValue).then(resolve, reject);
  return builder;
}

describe('migration 011_seed_new_laboratorios', () => {
  it('insere os 7 laboratórios apenas quando ainda não existem (idempotente)', async () => {
    const insertedNames: string[] = [];
    const knex = jest.fn((_table: string) => {
      const builder = mockQuery(undefined);
      builder.first = jest.fn(() => Promise.resolve(undefined));
      builder.insert = jest.fn((payload: any) => {
        insertedNames.push(payload.name);
        return Promise.resolve();
      });
      builder.update = jest.fn(() => Promise.resolve());
      return builder;
    }) as any;

    await up(knex);

    expect(insertedNames).toEqual(
      expect.arrayContaining([
        expect.stringContaining('LAQAMB'),
        expect.stringContaining('LAPP'),
        expect.stringContaining('MAKER'),
        expect.stringContaining('OFICINA'),
        expect.stringContaining('LQOI'),
        expect.stringContaining('LASIC'),
      ])
    );
    expect(insertedNames).toHaveLength(6);
  });

  it('não insere de novo um laboratório que já existe', async () => {
    let insertCalls = 0;
    const knex = jest.fn((_table: string) => {
      const builder = mockQuery(undefined);
      builder.first = jest.fn(() => Promise.resolve({ id: 'existing-id' }));
      builder.insert = jest.fn(() => {
        insertCalls += 1;
        return Promise.resolve();
      });
      builder.update = jest.fn(() => Promise.resolve());
      return builder;
    }) as any;

    await up(knex);

    expect(insertCalls).toBe(0);
  });
});
