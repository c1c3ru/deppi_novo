import { Request, Response, NextFunction } from 'express';

const mockDb = jest.fn() as any;
mockDb.fn = { now: jest.fn(() => 'NOW()') };
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
import { calendarService } from '../services/calendar.service';

// Simula um Knex QueryBuilder: encadeável e "thenable" (awaitable),
// resolvendo sempre para `resolveValue` (array ou objeto único, conforme
// o método real chamaria — ex: .first() resolve para objeto, o restante
// para array).
function mockQuery(resolveValue: unknown) {
  const builder: any = {};
  const chainableMethods = [
    'select',
    'orderBy',
    'where',
    'whereIn',
    'join',
    'insert',
    'returning',
    'update',
    'first',
  ];
  chainableMethods.forEach((method) => {
    builder[method] = jest.fn(() => builder);
  });
  builder.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(resolveValue).then(resolve, reject);
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

describe('VisitController.create — limite de alunos por visita', () => {
  it('rejeita com 400 quando students_count é maior que 50, sem tocar o banco', async () => {
    const req = {
      body: {
        school_name: 'Escola Grande',
        responsible_name: 'Fulano',
        contact_email: 'fulano@escola.edu.br',
        contact_phone: '(85) 99999-9999',
        students_count: 51,
        target_date: '2026-10-05',
        shift: 'M',
      },
    } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    await visitController.create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('50') })
    );
    expect(mockDb).not.toHaveBeenCalled();
  });

  it('aceita exatamente 50 alunos (limite máximo, não bloqueante)', async () => {
    const insertedVisit = {
      id: 'v-50',
      school_name: 'Escola no Limite',
      students_count: 50,
      status: 'pending',
    };

    const insertBuilder: any = {};
    insertBuilder.insert = jest.fn(() => insertBuilder);
    insertBuilder.returning = jest.fn(() => insertBuilder);
    insertBuilder.then = (resolve: (v: unknown) => void) =>
      Promise.resolve([insertedVisit]).then(resolve);

    mockDb
      .mockImplementationOnce(() => mockQuery([]))
      .mockImplementationOnce(() => insertBuilder)
      .mockImplementationOnce(() => mockQuery([]));

    const req = {
      body: {
        school_name: 'Escola no Limite',
        responsible_name: 'Fulano',
        contact_email: 'fulano@escola.edu.br',
        contact_phone: '(85) 99999-9999',
        students_count: 50,
        target_date: '2026-10-06',
        shift: 'M',
      },
    } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    await visitController.create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('VisitController.create — status padrão PENDING', () => {
  it('salva a nova solicitação de visita com status "pending", nunca "confirmed"', async () => {
    const insertedVisit = {
      id: 'v-new',
      school_name: 'Escola Nova',
      responsible_name: 'Ciclana',
      contact_email: 'ciclana@escola.edu.br',
      contact_phone: '(85) 98888-7777',
      students_count: 15,
      target_date: '2026-10-01',
      shift: 'T',
      status: 'pending',
    };

    let insertPayload: any;
    const insertBuilder: any = {};
    insertBuilder.insert = jest.fn((payload: any) => {
      insertPayload = payload;
      return insertBuilder;
    });
    insertBuilder.returning = jest.fn(() => insertBuilder);
    insertBuilder.then = (resolve: (v: unknown) => void) =>
      Promise.resolve([insertedVisit]).then(resolve);

    mockDb
      .mockImplementationOnce(() => mockQuery([])) // checagem de conflito de horário — nenhuma visita existente
      .mockImplementationOnce(() => insertBuilder) // insert em school_visits
      .mockImplementationOnce(() => mockQuery([])); // laboratorios cadastrados — nenhum, pula vínculo automático

    const req = {
      body: {
        school_name: insertedVisit.school_name,
        responsible_name: insertedVisit.responsible_name,
        contact_email: insertedVisit.contact_email,
        contact_phone: insertedVisit.contact_phone,
        students_count: insertedVisit.students_count,
        target_date: insertedVisit.target_date,
        shift: insertedVisit.shift,
      },
    } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    await visitController.create(req, res, next);

    expect(insertPayload).toEqual(expect.objectContaining({ status: 'pending' }));
    expect(insertPayload.status).not.toBe('confirmed');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(insertedVisit);
  });
});

describe('VisitController.updateStatus — aprovação e integração com o Google Calendar', () => {
  const visitRow = {
    id: 'v1',
    school_name: 'Escola X',
    responsible_name: 'Fulano',
    contact_email: 'fulano@escola.edu.br',
    contact_phone: '(85) 99999-9999',
    students_count: 10,
    target_date: '2026-09-01',
    shift: 'M',
    status: 'pending',
  };

  it('ao confirmar a visita, chama a criação do evento no Google Calendar exatamente uma vez', async () => {
    (calendarService.isTimeSlotBusy as jest.Mock).mockResolvedValue(false);

    mockDb
      .mockImplementationOnce(() => mockQuery(visitRow)) // school_visits.where(id).first()
      .mockImplementationOnce(() => mockQuery([{ name: 'Lab A' }])) // labs disponíveis (join/select)
      .mockImplementationOnce(() =>
        mockQuery([{ ...visitRow, status: 'confirmed' }])
      ); // update().returning('*')

    const req = {
      params: { id: 'v1' },
      body: { status: 'confirmed' },
    } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    await visitController.updateStatus(req, res, next);

    expect(calendarService.createVisitEvent).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'confirmed' })
    );
  });

  it('não chama o Google Calendar quando a mudança de status não é para "confirmed"', async () => {
    mockDb
      .mockImplementationOnce(() => mockQuery(visitRow)) // school_visits.where(id).first()
      .mockImplementationOnce(() => mockQuery([{ name: 'Lab A' }])) // labs disponíveis
      .mockImplementationOnce(() =>
        mockQuery([{ ...visitRow, status: 'canceled' }])
      ); // update().returning('*')

    const req = {
      params: { id: 'v1' },
      body: { status: 'canceled' },
    } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    await visitController.updateStatus(req, res, next);

    expect(calendarService.createVisitEvent).not.toHaveBeenCalled();
  });
});
