import express from 'express';
import request from 'supertest';

jest.mock('../database/db', () => ({ __esModule: true, default: jest.fn() }));
// Os testes aqui tratam do campo do edital, não da autenticação: o
// middleware só marca a requisição como de um usuário logado.
jest.mock('../middleware/auth.middleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { id: 1 };
    next();
  },
  optionalAuthMiddleware: (_req: any, _res: any, next: any) => next(),
}));

import revistaRoutes, { normalizarEditalUrl } from './revista.routes';
import db from '../database/db';

function mockQuery(resolveValue: unknown) {
  const builder: any = {};
  ['where', 'orderBy', 'insert', 'returning', 'update', 'first'].forEach(
    (method) => {
      builder[method] = jest.fn(() => builder);
    }
  );
  builder.then = (
    resolve: (v: unknown) => void,
    reject?: (e: unknown) => void
  ) => Promise.resolve(resolveValue).then(resolve, reject);
  return builder;
}

describe('normalizarEditalUrl', () => {
  it('aceita PDF enviado pelo site e links http(s)', () => {
    expect(normalizarEditalUrl('/uploads/edital-2026.pdf')).toEqual({
      ok: true,
      url: '/uploads/edital-2026.pdf',
    });
    expect(normalizarEditalUrl(' https://ifce.edu.br/edital.pdf ')).toEqual({
      ok: true,
      url: 'https://ifce.edu.br/edital.pdf',
    });
  });

  it('trata vazio e ausente como "sem edital"', () => {
    expect(normalizarEditalUrl('')).toEqual({ ok: true, url: null });
    expect(normalizarEditalUrl(null)).toEqual({ ok: true, url: null });
    expect(normalizarEditalUrl(undefined)).toEqual({ ok: true, url: null });
  });

  it('recusa esquemas perigosos, caminhos com .. e texto solto', () => {
    expect(normalizarEditalUrl('javascript:alert(1)').ok).toBe(false);
    expect(normalizarEditalUrl('data:text/html,<b>x</b>').ok).toBe(false);
    expect(normalizarEditalUrl('/uploads/../.env').ok).toBe(false);
    expect(normalizarEditalUrl('edital.pdf').ok).toBe(false);
    expect(normalizarEditalUrl(42).ok).toBe(false);
  });
});

describe('Rotas dos anais — edital da edição', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/revista', revistaRoutes);
  const mockedDb = db as unknown as jest.Mock;

  it('devolve editalUrl na lista pública de edições', async () => {
    mockedDb.mockReturnValue(
      mockQuery([
        {
          id: 2,
          volume: 2,
          ano: 2026,
          title: 'Mostra 2026',
          status: 'published',
          edital_url: '/uploads/edital-2026.pdf',
        },
      ])
    );

    const res = await request(app).get('/api/revista/edicoes');

    expect(res.status).toBe(200);
    expect(res.body.data[0].editalUrl).toBe('/uploads/edital-2026.pdf');
  });

  it('grava o edital ao atualizar a edição', async () => {
    const builder = mockQuery({ id: 2, published_at: null });
    mockedDb.mockReturnValue(builder);

    const res = await request(app)
      .put('/api/revista/edicoes/2')
      .send({ editalUrl: '/uploads/edital-2026.pdf' });

    expect(res.status).toBe(200);
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ edital_url: '/uploads/edital-2026.pdf' })
    );
  });

  it('recusa link de edital perigoso sem tocar no banco', async () => {
    const res = await request(app)
      .put('/api/revista/edicoes/2')
      .send({ editalUrl: 'javascript:alert(1)' });

    expect(res.status).toBe(400);
    expect(mockedDb).not.toHaveBeenCalled();
  });
});
