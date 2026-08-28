import { getTodayISODate, subtractDaysFromISODate } from './date';

describe('getTodayISODate', () => {
  it('usa o fuso America/Sao_Paulo por padrão e retorna o dia anterior ao UTC perto da meia-noite', () => {
    // 2026-03-10T02:00:00Z = 2026-03-09T23:00:00 em São Paulo (UTC-3)
    const reference = new Date('2026-03-10T02:00:00.000Z');
    expect(getTodayISODate(undefined, reference)).toBe('2026-03-09');
  });

  it('respeita um fuso horário diferente quando informado', () => {
    const reference = new Date('2026-03-10T02:00:00.000Z');
    // UTC: mesmo instante, mas já é dia 10 em fuso UTC
    expect(getTodayISODate('UTC', reference)).toBe('2026-03-10');
  });
});

describe('subtractDaysFromISODate', () => {
  it('subtrai dias corretamente dentro do mesmo mês', () => {
    expect(subtractDaysFromISODate('2026-08-28', 30)).toBe('2026-07-29');
  });

  it('atravessa a virada de ano corretamente', () => {
    expect(subtractDaysFromISODate('2026-01-05', 10)).toBe('2025-12-26');
  });

  it('lida com anos bissextos', () => {
    expect(subtractDaysFromISODate('2028-03-01', 1)).toBe('2028-02-29');
  });
});
