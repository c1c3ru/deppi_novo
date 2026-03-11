import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { contactController } from '../controllers/contact.controller';

const router = Router();

// Strict rate limit: no more than 5 contact messages per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: 'Limite de mensagens atingido. Tente novamente em 1 hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Envia uma mensagem de contato para o e-mail do DEPPI
 *     tags: [Contact]
 */
router.post(
  '/',
  contactLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 3, max: 150 })
      .withMessage('Nome inválido'),
    body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Assunto inválido'),
    body('message')
      .trim()
      .isLength({ min: 20, max: 5000 })
      .withMessage('Mensagem inválida'),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: 'Dados inválidos', details: errors.array() });
    }
    next();
  },
  contactController.sendContactMessage.bind(contactController)
);

export default router;
