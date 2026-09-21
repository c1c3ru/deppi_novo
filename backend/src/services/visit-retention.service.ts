import db from '../database/db';
import { getTodayISODate, subtractDaysFromISODate } from '../utils/date';
import { VISIT_HISTORY_RETENTION_DAYS } from '../types/visit.types';
import { logger } from '../utils/logger';

// Data de corte da janela de retenção: "hoje - 30 dias". Visitas com
// `target_date` a partir dessa data (inclusive) até hoje são "realizadas";
// anteriores a ela são removidas pela limpeza diária.
export function getRetentionCutoffDate(referenceDate?: Date): string {
  const today = getTodayISODate(undefined, referenceDate);
  return subtractDaysFromISODate(today, VISIT_HISTORY_RETENTION_DAYS);
}

export const visitRetentionService = {
  getRetentionCutoffDate,

  // Hard delete das visitas com `target_date` estritamente anterior à
  // data de corte. `visit_lab_availability` é removida em cascata pela FK
  // (ON DELETE CASCADE — ver migration 008_create_school_visits_tables).
  async deleteExpiredVisits(): Promise<{ deletedCount: number; cutoffDate: string }> {
    const cutoffDate = getRetentionCutoffDate();

    const deletedCount = await db('school_visits')
      .where('target_date', '<', cutoffDate)
      .del();

    if (deletedCount > 0) {
      logger.info(
        `[visit-retention] ${deletedCount} visita(s) anterior(es) a ${cutoffDate} removida(s).`
      );
    }

    return { deletedCount, cutoffDate };
  },
};
