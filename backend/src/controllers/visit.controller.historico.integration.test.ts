// Teste de integração real: usa o módulo `db` de verdade (Postgres), sem
// mocks de persistência — precisa de uma instância Postgres acessível via
// DATABASE_URL, já migrada, igual ao job "backend-tests" do CI.
jest.mock('../services/email.service', () => ({
  emailService: {
    sendVisitPendingEmail: jest.fn(),
    sendVisitConfirmationEmail: jest.fn(),
  },
}));
jest.mock('../services/calendar.service', () => ({
  calendarService: {
    isTimeSlotBusy: jest.fn(),
    createVisitEvent: jest.fn(),
  },
}));

import express from 'express';
import request from 'supertest';
import visitRoutes from '../routes/visit.routes';
import db from '../database/db';
import { getTodayISODate, subtractDaysFromISODate } from '../utils/date';

const TEST_SCHOOL_PREFIX = 'Escola Teste Integração Histórico Visitas';

function buildVisitPayload(
  daysAgo: number,
  suffix: string,
  status: 'confirmed' | 'pending' | 'canceled' = 'confirmed'
) {
  const today = getTodayISODate();
  return {
    school_name: `${TEST_SCHOOL_PREFIX} — ${suffix}`,
    responsible_name: 'Responsável Teste',
    contact_email: `historico-${suffix}@escola-teste.edu.br`,
    contact_phone: '(85) 99999-0001',
    students_count: 12,
    target_date: subtractDaysFromISODate(today, daysAgo),
    shift: 'T',
    status,
  };
}

describe('GET /visitas/realizadas — histórico com retenção de 30 dias (Postgres real)', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/visitas', visitRoutes);

  afterEach(async () => {
    await db('school_visits')
      .where('school_name', 'like', `${TEST_SCHOOL_PREFIX}%`)
      .del();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('não retorna uma visita agendada para 31 dias atrás', async () => {
    await db('school_visits').insert(buildVisitPayload(31, 'muito-antiga'));

    const res = await request(app).get('/api/visitas/realizadas');

    expect(res.status).toBe(200);
    const schoolNames = res.body.map((v: { school_name: string }) => v.school_name);
    expect(schoolNames).not.toContain(
      `${TEST_SCHOOL_PREFIX} — muito-antiga`
    );
  });

  it('retorna visitas confirmadas dentro da janela de 30 dias (hoje e há 30 dias)', async () => {
    await db('school_visits').insert(buildVisitPayload(0, 'hoje'));
    await db('school_visits').insert(buildVisitPayload(30, 'limite-30-dias'));

    const res = await request(app).get('/api/visitas/realizadas');

    expect(res.status).toBe(200);
    const schoolNames = res.body.map((v: { school_name: string }) => v.school_name);
    expect(schoolNames).toContain(`${TEST_SCHOOL_PREFIX} — hoje`);
    expect(schoolNames).toContain(`${TEST_SCHOOL_PREFIX} — limite-30-dias`);
  });

  it('não retorna visitas pendentes/canceladas, mesmo dentro da janela de 30 dias', async () => {
    await db('school_visits').insert(buildVisitPayload(5, 'pendente', 'pending'));
    await db('school_visits').insert(buildVisitPayload(5, 'cancelada', 'canceled'));

    const res = await request(app).get('/api/visitas/realizadas');

    const schoolNames = res.body.map((v: { school_name: string }) => v.school_name);
    expect(schoolNames).not.toContain(`${TEST_SCHOOL_PREFIX} — pendente`);
    expect(schoolNames).not.toContain(`${TEST_SCHOOL_PREFIX} — cancelada`);
  });

  it('para visitante anônimo, não expõe e-mail/telefone de contato no histórico', async () => {
    const payload = buildVisitPayload(2, 'lgpd');
    await db('school_visits').insert(payload);

    const res = await request(app).get('/api/visitas/realizadas');

    const visita = res.body.find(
      (v: { school_name: string }) => v.school_name === payload.school_name
    );
    expect(visita).toBeDefined();
    expect(visita).not.toHaveProperty('contact_email');
    expect(visita).not.toHaveProperty('contact_phone');
  });
});
