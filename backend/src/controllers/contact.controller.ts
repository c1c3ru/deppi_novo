import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import { logger } from '../utils/logger';

export class ContactController {
  public async sendContactMessage(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        return;
      }

      await emailService.sendContactEmail({ name, email, subject, message });

      res.status(200).json({ message: 'Mensagem enviada com sucesso' });
    } catch (error) {
      logger.error('Error sending contact message:', error);
      res.status(500).json({ error: 'Falha ao enviar mensagem' });
    }
  }
}

export const contactController = new ContactController();
