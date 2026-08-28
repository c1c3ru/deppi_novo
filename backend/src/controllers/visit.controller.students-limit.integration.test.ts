// Teste de integração real: usa o módulo `db` de verdade (Postgres), sem
// mocks de persistência — só e-mail/calendário são mockados, pois disparar
// SMTP/Google real não faz parte do que este teste precisa provar.
// Requer uma instância Postgres acessível via DATABASE_URL (ou DB_* env
// vars), já migrada — exatamente como o job "backend-tests" do CI
// (.github/workflows/ci-cd.yml) configura antes de rodar os testes.
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

const TEST_SCHOOL_PREFIX = 'Escola Teste Integração Limite Alunos';

describe('POST /visitas — limite de 50 alunos e persistência dos novos campos (Postgres real)', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/visitas', visitRoutes);

  afterEach(async () => {
    const visits = await db('school_visits')
      .where('school_name', 'like', `${TEST_SCHOOL_PREFIX}%`)
      .select('id');
    const ids = visits.map((v: { id: string }) => v.id);
    if (ids.length > 0) {
      await db('visit_lab_availability').whereIn('visit_id', ids).del();
      await db('school_visits').whereIn('id', ids).del();
    }
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('rejeita com 400 uma solicitação com 51 alunos e não grava nada no banco', async () => {
    const res = await request(app)
      .post('/api/visitas')
      .send({
        school_name: `${TEST_SCHOOL_PREFIX} — Acima`,
        responsible_name: 'Responsável Teste',
        contact_email: 'responsavel@escola-teste.edu.br',
        contact_phone: '(85) 99999-0001',
        students_count: 51,
        target_date: '2027-03-10',
        shift: 'M',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/50/);

    const saved = await db('school_visits').where({
      school_name: `${TEST_SCHOOL_PREFIX} — Acima`,
    });
    expect(saved).toHaveLength(0);
  });

  it('aceita exatamente 50 alunos (limite máximo) e persiste todos os novos campos corretamente', async () => {
    const payload = {
      school_name: `${TEST_SCHOOL_PREFIX} — No Limite`,
      school_city: 'Maracanaú',
      school_network: 'municipal',
      director_name: 'Diretora Exemplo da Silva',
      responsible_name: 'Professor Exemplo',
      contact_email: 'professor@escola-teste.edu.br',
      contact_phone: '(85) 99999-0002',
      institutional_email: 'secretaria@escola-teste.edu.br',
      whatsapp_phone: '(85) 98888-0003',
      class_supervisors: 'Maria Silva e João Souza',
      grade_level: '9º ano do Ensino Fundamental',
      students_count: 50,
      target_date: '2027-03-11',
      shift: 'T',
      notes: 'Turma com um aluno cadeirante — precisa de acesso facilitado.',
    };

    const res = await request(app).post('/api/visitas').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({ status: 'pending', students_count: 50 })
    );

    const saved = await db('school_visits').where({ id: res.body.id }).first();
    expect(saved).toMatchObject({
      school_name: payload.school_name,
      school_city: payload.school_city,
      school_network: payload.school_network,
      director_name: payload.director_name,
      responsible_name: payload.responsible_name,
      contact_email: payload.contact_email,
      contact_phone: payload.contact_phone,
      institutional_email: payload.institutional_email,
      whatsapp_phone: payload.whatsapp_phone,
      class_supervisors: payload.class_supervisors,
      grade_level: payload.grade_level,
      notes: payload.notes,
      students_count: 50,
      status: 'pending',
    });
  });

  it('grava null (não quebra) para os novos campos quando eles não são enviados', async () => {
    const res = await request(app)
      .post('/api/visitas')
      .send({
        school_name: `${TEST_SCHOOL_PREFIX} — Sem Campos Novos`,
        responsible_name: 'Responsável Teste',
        contact_email: 'responsavel2@escola-teste.edu.br',
        contact_phone: '(85) 99999-0004',
        students_count: 25,
        target_date: '2027-03-12',
        shift: 'N',
      });

    expect(res.status).toBe(201);

    const saved = await db('school_visits').where({ id: res.body.id }).first();
    expect(saved.school_city).toBeNull();
    expect(saved.notes).toBeNull();
  });
});
