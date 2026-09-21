import { Request, Response, NextFunction } from 'express';
import db from '../database/db';

// productions/services são armazenados como JSON serializado; normaliza
// para array em todo endpoint que devolve um laboratório ao cliente.
// Função solta (não método) porque as rotas passam os handlers da classe
// sem .bind(), então `this` não está disponível dentro deles.
function formatLab(lab: any) {
  return {
    ...lab,
    productions:
      typeof lab.productions === 'string'
        ? JSON.parse(lab.productions) || []
        : lab.productions || [],
    services:
      typeof lab.services === 'string'
        ? JSON.parse(lab.services) || []
        : lab.services || [],
  };
}

export class LaboratorioController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const labs = await db('laboratorios').select('*');
      res.json(labs.map((lab: any) => formatLab(lab)));
    } catch (error) {
      next(error);
    }
  }

  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, shift } = req.query;

      if (!date || !shift) {
        return res.status(400).json({ message: 'Parâmetros date e shift são obrigatórios' });
      }

      const labs = await db('laboratorios').select('*');

      // Encontra laboratórios já ocupados naquela data e turno por uma visita confirmada
      const occupiedLabs = await db('visit_lab_availability')
        .join('school_visits', 'visit_lab_availability.visit_id', 'school_visits.id')
        .where('school_visits.target_date', date as string)
        .where('school_visits.shift', shift as string)
        .where('school_visits.status', 'confirmed')
        .where('visit_lab_availability.status', 'available')
        .select('visit_lab_availability.lab_id');

      const occupiedLabIds = new Set(occupiedLabs.map((ol: any) => ol.lab_id));

      const formatted = labs.map((lab: any) => ({
        ...formatLab(lab),
        availabilityStatus: occupiedLabIds.has(lab.id) ? 'unavailable' : 'available',
      }));

      res.json(formatted);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lab = await db('laboratorios').where({ id }).first();

      if (!lab) {
        return res.status(404).json({ message: 'Lab não encontrado' });
      }

      res.json(formatLab(lab));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, cover_image, productions, services } =
        req.body;
      const [newLab] = await db('laboratorios')
        .insert({
          name,
          description,
          cover_image,
          productions: JSON.stringify(productions || []),
          services: JSON.stringify(services || []),
        })
        .returning('*');

      res.status(201).json(formatLab(newLab));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, cover_image, productions, services } =
        req.body;

      const payload: any = {};
      if (name !== undefined) payload.name = name;
      if (description !== undefined) payload.description = description;
      if (cover_image !== undefined) payload.cover_image = cover_image;
      if (productions !== undefined)
        payload.productions = JSON.stringify(productions);
      if (services !== undefined) payload.services = JSON.stringify(services);

      payload.updated_at = db.fn.now();

      const [updated] = await db('laboratorios')
        .where({ id })
        .update(payload)
        .returning('*');

      if (!updated) {
        return res.status(404).json({ message: 'Não encontrado' });
      }

      res.json(formatLab(updated));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const count = await db('laboratorios').where({ id }).del();

      if (!count) {
        return res.status(404).json({ message: 'Não encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const laboratorioController = new LaboratorioController();
