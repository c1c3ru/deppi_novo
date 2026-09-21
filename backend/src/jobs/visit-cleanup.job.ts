import { schedule, ScheduledTask } from 'node-cron';
import { visitRetentionService } from '../services/visit-retention.service';
import { DEFAULT_TIMEZONE } from '../utils/date';
import { logger } from '../utils/logger';

// Roda todo dia às 3h (horário de São Paulo) — fora do horário comercial,
// quando o tráfego da API é mínimo.
const CRON_EXPRESSION = '0 3 * * *';

let task: ScheduledTask | undefined;

export function startVisitCleanupJob(): ScheduledTask {
  task = schedule(
    CRON_EXPRESSION,
    async () => {
      try {
        await visitRetentionService.deleteExpiredVisits();
      } catch (error) {
        logger.error('[visit-cleanup] Falha ao limpar visitas expiradas:', error);
      }
    },
    { timezone: DEFAULT_TIMEZONE, name: 'visit-cleanup' }
  );

  return task;
}
