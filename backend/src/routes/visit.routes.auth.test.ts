import express from 'express';
import request from 'supertest';

// Evita efeitos colaterais de conexão real ao importar o controller
// (Postgres/SMTP/Google) — os testes de autorização abaixo nunca devem
// alcançar o controller, pois a requisição deve ser barrada pelo
// middleware de autenticação antes disso.
jest.mock('../database/db', () => ({ __esModule: true, default: jest.fn() }));
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

import visitRoutes from './visit.routes';
import db from '../database/db';

// Mesmo simulador de Knex QueryBuilder usado em visit.controller.test.ts —
// encadeável e "thenable" (awaitable).
function mockQuery(resolveValue: unknown) {
  const builder: any = {};
  ['select', 'orderBy', 'where', 'whereIn', 'join', 'insert', 'returning', 'update', 'first'].forEach(
    (method) => {
      builder[method] = jest.fn(() => builder);
    }
  );
  builder.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(resolveValue).then(resolve, reject);
  return builder;
}

describe('Rotas de visitas — autorização de aprovação (PATCH /:id/status)', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/visitas', visitRoutes);

  it('rejeita com 401 uma tentativa de aprovação sem token de autenticação', async () => {
    const res = await request(app)
      .patch('/api/visitas/some-visit-id/status')
      .send({ status: 'confirmed' });

    expect(res.status).toBe(401);
  });

  it('rejeita com 401 uma tentativa de aprovação com token inválido', async () => {
    const res = await request(app)
      .patch('/api/visitas/some-visit-id/status')
      .set('Authorization', 'Bearer token-invalido-e-mal-formado')
      .send({ status: 'confirmed' });

    expect(res.status).toBe(401);
  });
});

describe('Rotas de visitas — autorização de adição de laboratório (POST /:id/labs)', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/visitas', visitRoutes);

  it('rejeita com 401 uma tentativa anônima de adicionar laboratório a uma visita', async () => {
    const res = await request(app)
      .post('/api/visitas/some-visit-id/labs')
      .send({ lab_id: 'lab-1' });

    expect(res.status).toBe(401);
  });
});

describe('Rotas de visitas — criação pública (POST /) permanece acessível sem autenticação', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/visitas', visitRoutes);

  it('não bloqueia a criação de solicitações de visita por visitantes anônimos', async () => {
    const insertedVisit = {
      id: 'v-anon',
      school_name: 'Escola Anônima',
      responsible_name: 'Beltrano',
      contact_email: 'beltrano@escola.edu.br',
      contact_phone: '(85) 97777-6666',
      students_count: 12,
      target_date: '2026-11-01',
      shift: 'M',
      status: 'pending',
    };

    const insertBuilder: any = {};
    insertBuilder.insert = jest.fn(() => insertBuilder);
    insertBuilder.returning = jest.fn(() => insertBuilder);
    insertBuilder.then = (resolve: (v: unknown) => void) =>
      Promise.resolve([insertedVisit]).then(resolve);

    (db as unknown as jest.Mock)
      .mockImplementationOnce(() => mockQuery([])) // checagem de conflito
      .mockImplementationOnce(() => insertBuilder) // insert em school_visits
      .mockImplementationOnce(() => mockQuery([])); // laboratorios cadastrados

    const res = await request(app).post('/api/visitas').send({
      school_name: insertedVisit.school_name,
      responsible_name: insertedVisit.responsible_name,
      contact_email: insertedVisit.contact_email,
      contact_phone: insertedVisit.contact_phone,
      students_count: insertedVisit.students_count,
      target_date: insertedVisit.target_date,
      shift: insertedVisit.shift,
    });

    // A rota pública de criação não exige autenticação (sem authMiddleware).
    expect(res.status).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ status: 'pending' }));
  });
});
