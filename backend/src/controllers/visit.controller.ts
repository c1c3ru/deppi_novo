import { Request, Response, NextFunction } from 'express';
import db from '../database/db';
import { emailService } from '../services/email.service';
import { calendarService } from '../services/calendar.service';

export class VisitController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const isAuthenticated = !!(req as any).user;

      // Visitantes anônimos só enxergam a agenda pública (visitas confirmadas),
      // sem dados de contato. Solicitações pendentes/canceladas e dados de
      // contato só são expostos para usuários autenticados (gestão).
      const query = db('school_visits')
        .select('*')
        .orderBy('target_date', 'asc');

      if (!isAuthenticated) {
        query.where({ status: 'confirmed' });
      }

      const visits = await query;

      if (isAuthenticated) {
        return res.json(visits);
      }

      const publicVisits = visits.map((visit: any) => ({
        id: visit.id,
        school_name: visit.school_name,
        responsible_name: visit.responsible_name,
        students_count: visit.students_count,
        target_date: visit.target_date,
        shift: visit.shift,
        status: visit.status,
      }));

      res.json(publicVisits);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const visit = await db('school_visits').where({ id }).first();

      if (!visit) {
        return res.status(404).json({ message: 'Visita não encontrada' });
      }

      const labs = await db('visit_lab_availability')
        .join(
          'laboratorios',
          'visit_lab_availability.lab_id',
          'laboratorios.id'
        )
        .select(
          'laboratorios.name',
          'visit_lab_availability.status',
          'visit_lab_availability.lab_id'
        )
        .where({ visit_id: id });

      res.json({ ...visit, labs });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        school_name,
        responsible_name,
        contact_email,
        contact_phone,
        students_count,
        target_date,
        shift,
      } = req.body;

      // Constraint: O limite de alunos por visita não deve ultrapassar ~30
      if (students_count > 30) {
        return res
          .status(400)
          .json({ message: 'O limite de alunos por visita é 30.' });
      }

      // Risco: Múltiplas visitas na mesma data/horário gerando superlotação.
      const existingVisits = await db('school_visits')
        .where({ target_date, shift })
        .whereIn('status', ['confirmed', 'pending']);

      if (existingVisits.length > 0) {
        return res.status(400).json({
          message:
            'Já existe uma solicitação ou visita confirmada para esta data e turno.',
        });
      }

      const [newVisit] = await db('school_visits')
        .insert({
          school_name,
          responsible_name,
          contact_email,
          contact_phone,
          students_count,
          target_date,
          shift,
        })
        .returning('*');

      // O formulário público não seleciona laboratórios (são apenas
      // informativos), então toda visita nasce vinculada a todos os
      // laboratórios cadastrados, aguardando avaliação de disponibilidade.
      const laboratorios = await db('laboratorios').select('id');
      if (laboratorios.length > 0) {
        const labAvailabilities = laboratorios.map((lab: { id: string }) => ({
          visit_id: newVisit.id,
          lab_id: lab.id,
          status: 'pending',
        }));
        await db('visit_lab_availability').insert(labAvailabilities);
      }

      // Disparar email de pending
      await emailService.sendVisitPendingEmail(
        contact_email,
        school_name,
        target_date
      );

      res.status(201).json(newVisit);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const visit = await db('school_visits').where({ id }).first();
      if (!visit) {
        return res.status(404).json({ message: 'Visita não encontrada' });
      }

      const availableLabs = await db('visit_lab_availability')
        .join(
          'laboratorios',
          'visit_lab_availability.lab_id',
          'laboratorios.id'
        )
        .where({
          'visit_lab_availability.visit_id': id,
          'visit_lab_availability.status': 'available',
        })
        .select('laboratorios.name');

      // Invariante: Não deve ser possível aprovar sem pelo menos um laboratório com status "Disponível"
      if (status === 'confirmed' && availableLabs.length === 0) {
        return res.status(400).json({
          message:
            'Não é possível confirmar uma visita sem pelo menos um laboratório disponível.',
        });
      }

      // Invariante: Não deve ser possível confirmar sobre um horário já
      // ocupado na agenda do DEPPI (evita conflito com outros compromissos,
      // não só com outras visitas já cadastradas no sistema)
      if (status === 'confirmed') {
        const isBusy = await calendarService.isTimeSlotBusy(
          visit.target_date,
          visit.shift
        );
        if (isBusy) {
          return res.status(409).json({
            message:
              'Já existe um compromisso na agenda do DEPPI nesse horário. Verifique a agenda antes de confirmar.',
          });
        }
      }

      const [updated] = await db('school_visits')
        .where({ id })
        .update({ status, updated_at: db.fn.now() })
        .returning('*');

      if (status === 'confirmed') {
        const labNames = availableLabs.map((l: any) => l.name);
        await emailService.sendVisitConfirmationEmail(
          updated.contact_email,
          updated.school_name,
          updated.target_date,
          labNames
        );
        await calendarService.createVisitEvent({
          schoolName: updated.school_name,
          responsibleName: updated.responsible_name,
          contactEmail: updated.contact_email,
          contactPhone: updated.contact_phone,
          studentsCount: updated.students_count,
          targetDate: updated.target_date,
          shift: updated.shift,
          labs: labNames,
        });
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async updateLabAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, lab_id } = req.params;
      const { status } = req.body;

      const updated_by_user_id = (req as any).user?.id || null;

      const [updated] = await db('visit_lab_availability')
        .where({ visit_id: id, lab_id })
        .update({ status, updated_by_user_id, updated_at: db.fn.now() })
        .returning('*');

      if (!updated) {
        return res.status(404).json({ message: 'Não encontrado' });
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
}

export const visitController = new VisitController();
