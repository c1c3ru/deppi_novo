import { Request, Response, NextFunction } from 'express';

const mockDb = jest.fn();
jest.mock('../database/db', () => ({ __esModule: true, default: mockDb }));
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

import { visitController } from './visit.controller';

// Simula um Knex QueryBuilder: encadeável e "thenable" (awaitable),
// resolvendo para as linhas passadas em `rows`.
function mockQuery(rows: unknown[]) {
  const builder: any = {};
  builder.select = jest.fn(() => builder);
  builder.orderBy = jest.fn(() => builder);
  builder.where = jest.fn(() => builder);
  builder.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(rows).then(resolve, reject);
  return builder;
}

function makeRes() {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('VisitController.getAll — filtragem LGPD de dados públicos', () => {
  const dbRow = {
    id: 'v1',
    school_name: 'Escola Municipal X',
    responsible_name: 'Fulano de Tal',
    contact_email: 'fulano@escola.edu.br',
    contact_phone: '(85) 99999-9999',
    students_count: 20,
    target_date: '2026-09-15',
    shift: 'M',
    status: 'confirmed',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-01T00:00:00.000Z',
  };

  it('para visitantes não autenticados, retorna estritamente nome do responsável, nome da escola, quantidade de alunos, data e turno — sem e-mail ou telefone', async () => {
    mockDb.mockReturnValue(mockQuery([dbRow]));
    const req = { user: undefined } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    await visitController.getAll(req, res, next);

    expect(res.json).toHaveBeenCalledTimes(1);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload).toHaveLength(1);

    const publicVisit = payload[0];
    expect(publicVisit).toEqual(
      expect.objectContaining({
        responsible_name: dbRow.responsible_name,
        school_name: dbRow.school_name,
        students_count: dbRow.students_count,
        target_date: dbRow.target_date,
        shift: dbRow.shift,
      })
    );

    // Dados sensíveis (LGPD) nunca devem chegar ao client anônimo.
    expect(publicVisit).not.toHaveProperty('contact_email');
    expect(publicVisit).not.toHaveProperty('contact_phone');
    expect(JSON.stringify(publicVisit)).not.toContain(dbRow.contact_email);
    expect(JSON.stringify(publicVisit)).not.toContain(dbRow.contact_phone);
  });

  it('restringe a consulta anônima a visitas confirmadas', async () => {
    const query = mockQuery([dbRow]);
    mockDb.mockReturnValue(query);
    const req = { user: undefined } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    await visitController.getAll(req, res, next);

    expect(query.where).toHaveBeenCalledWith({ status: 'confirmed' });
  });

  it('para usuários autenticados (gestão), inclui os dados de contato completos', async () => {
    mockDb.mockReturnValue(mockQuery([dbRow]));
    const req = { user: { id: 'admin-1' } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    await visitController.getAll(req, res, next);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload[0]).toHaveProperty('contact_email', dbRow.contact_email);
    expect(payload[0]).toHaveProperty('contact_phone', dbRow.contact_phone);
  });
});
