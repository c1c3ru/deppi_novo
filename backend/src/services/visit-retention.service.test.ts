const mockDb = jest.fn() as any;
jest.mock('../database/db', () => ({ __esModule: true, default: mockDb }));

import { visitRetentionService, getRetentionCutoffDate } from './visit-retention.service';

function mockDeleteQuery(deletedCount: number) {
  const builder: any = {};
  builder.where = jest.fn(() => builder);
  builder.del = jest.fn(() => Promise.resolve(deletedCount));
  return builder;
}

describe('getRetentionCutoffDate', () => {
  it('calcula "hoje - 30 dias" a partir de uma data de referência', () => {
    const reference = new Date('2026-08-28T12:00:00.000Z');
    expect(getRetentionCutoffDate(reference)).toBe('2026-07-29');
  });
});

describe('visitRetentionService.deleteExpiredVisits', () => {
  it('deleta apenas visitas com target_date anterior à data de corte', async () => {
    const builder = mockDeleteQuery(3);
    mockDb.mockReturnValue(builder);

    const result = await visitRetentionService.deleteExpiredVisits();

    expect(mockDb).toHaveBeenCalledWith('school_visits');
    expect(builder.where).toHaveBeenCalledWith(
      'target_date',
      '<',
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
    );
    expect(builder.del).toHaveBeenCalledTimes(1);
    expect(result.deletedCount).toBe(3);
  });

  it('retorna deletedCount 0 quando não há visitas expiradas', async () => {
    const builder = mockDeleteQuery(0);
    mockDb.mockReturnValue(builder);

    const result = await visitRetentionService.deleteExpiredVisits();

    expect(result.deletedCount).toBe(0);
  });
});
