export const MAX_STUDENTS_PER_VISIT = 50;

// Janela de retenção do histórico de "Visitas Realizadas": mantém apenas
// visitas com data entre hoje e hoje - 30 dias; mais antigas que isso são
// removidas pela rotina de limpeza (ver visit-retention.service.ts).
export const VISIT_HISTORY_RETENTION_DAYS = 30;
