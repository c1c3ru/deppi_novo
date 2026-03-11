import { Request, Response } from 'express';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error: 'Recurso não encontrado',
  });
}
