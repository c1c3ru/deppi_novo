const scheduleMock = jest.fn();
jest.mock('node-cron', () => ({
  schedule: (...args: unknown[]) => scheduleMock(...args),
}));

const deleteExpiredVisitsMock = jest.fn().mockResolvedValue({
  deletedCount: 0,
  cutoffDate: '2026-01-01',
});
jest.mock('../services/visit-retention.service', () => ({
  visitRetentionService: { deleteExpiredVisits: deleteExpiredVisitsMock },
}));

import { startVisitCleanupJob } from './visit-cleanup.job';

describe('startVisitCleanupJob', () => {
  beforeEach(() => {
    scheduleMock.mockReset();
    deleteExpiredVisitsMock.mockClear();
  });

  it('agenda a limpeza diária no fuso America/Sao_Paulo', () => {
    scheduleMock.mockReturnValue({ id: 'fake-task' });

    startVisitCleanupJob();

    expect(scheduleMock).toHaveBeenCalledTimes(1);
    const [cronExpression, , options] = scheduleMock.mock.calls[0];
    expect(cronExpression).toBe('0 3 * * *');
    expect(options).toMatchObject({ timezone: 'America/Sao_Paulo' });
  });

  it('a tarefa agendada chama o serviço de limpeza de visitas expiradas', async () => {
    scheduleMock.mockImplementation(
      (_expr: string, fn: () => Promise<void>) => {
        return { id: 'fake-task', run: fn };
      }
    );

    const task: any = startVisitCleanupJob();
    await task.run();

    expect(deleteExpiredVisitsMock).toHaveBeenCalledTimes(1);
  });
});
