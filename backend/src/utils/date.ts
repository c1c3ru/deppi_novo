// `target_date` é uma coluna DATE (sem hora), então "hoje" precisa ser
// calculado no fuso horário correto antes de virar uma data de calendário
// — perto da meia-noite UTC, `new Date()` já pode estar no dia seguinte
// em relação ao horário de São Paulo.
export const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

// Retorna a data de hoje (YYYY-MM-DD) no fuso informado.
export function getTodayISODate(
  timeZone: string = DEFAULT_TIMEZONE,
  reference: Date = new Date()
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(reference);
}

// Subtrai `days` dias de uma data no formato YYYY-MM-DD, retornando
// também uma string YYYY-MM-DD. Opera em UTC "puro" (meio-dia fixo) para
// não sofrer com fuso horário/horário de verão na subtração em si — o
// fuso já foi resolvido ao calcular `isoDate` com `getTodayISODate`.
export function subtractDaysFromISODate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
