// Teste de integração real: usa o módulo `db` de verdade (Postgres), sem
// mocks — precisa de uma instância Postgres acessível via DATABASE_URL,
// já migrada, igual ao job "backend-tests" do CI.
import db from '../database/db';
import { visitRetentionService } from './visit-retention.service';
import { getTodayISODate, subtractDaysFromISODate } from '../utils/date';

const TEST_SCHOOL_PREFIX = 'Escola Teste Integração Retenção Visitas';

function buildVisitPayload(daysAgo: number, suffix: string) {
  const today = getTodayISODate();
  return {
    school_name: `${TEST_SCHOOL_PREFIX} — ${suffix}`,
    responsible_name: 'Responsável Teste',
    contact_email: `retencao-${suffix}@escola-teste.edu.br`,
    contact_phone: '(85) 99999-0000',
    students_count: 10,
    target_date: subtractDaysFromISODate(today, daysAgo),
    shift: 'M',
    status: 'confirmed',
  };
}

describe('visitRetentionService.deleteExpiredVisits (Postgres real)', () => {
  afterEach(async () => {
    await db('school_visits')
      .where('school_name', 'like', `${TEST_SCHOOL_PREFIX}%`)
      .del();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('remove visitas com mais de 30 dias e mantém as de até 30 dias', async () => {
    const [expirada31] = await db('school_visits')
      .insert(buildVisitPayload(31, '31-dias'))
      .returning('*');
    const [noLimite30] = await db('school_visits')
      .insert(buildVisitPayload(30, '30-dias'))
      .returning('*');
    const [dentroJanela29] = await db('school_visits')
      .insert(buildVisitPayload(29, '29-dias'))
      .returning('*');

    const result = await visitRetentionService.deleteExpiredVisits();

    expect(result.deletedCount).toBeGreaterThanOrEqual(1);

    const remaining = await db('school_visits')
      .where('school_name', 'like', `${TEST_SCHOOL_PREFIX}%`)
      .select('id');
    const remainingIds = remaining.map((v: { id: string }) => v.id);

    expect(remainingIds).not.toContain(expirada31.id);
    expect(remainingIds).toContain(noLimite30.id);
    expect(remainingIds).toContain(dentroJanela29.id);
  });

  it('remove em cascata os vínculos de visit_lab_availability da visita expirada', async () => {
    const [lab] = await db('laboratorios')
      .insert({
        name: 'LAB-RETENCAO-TESTE - Laboratório de Teste de Retenção',
        description: 'Laboratório usado apenas neste teste de integração.',
      })
      .returning('*');

    const [expirada] = await db('school_visits')
      .insert(buildVisitPayload(45, 'cascata'))
      .returning('*');
    await db('visit_lab_availability').insert({
      visit_id: expirada.id,
      lab_id: lab.id,
      status: 'available',
    });

    await visitRetentionService.deleteExpiredVisits();

    const vinculos = await db('visit_lab_availability').where({
      visit_id: expirada.id,
    });
    expect(vinculos).toHaveLength(0);

    await db('laboratorios').where({ id: lab.id }).del();
  });
});
