import { Router } from 'express';
import { contactController } from '../controllers/contact.controller';

const router = Router();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Envia uma mensagem de contato para o e-mail do DEPPI
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *       400:
 *         description: Dados incompletos ou inválidos
 *       500:
 *         description: Erro no servidor ao enviar o e-mail
 */
router.post('/', contactController.sendContactMessage);

export default router;
