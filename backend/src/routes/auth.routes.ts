import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import db from '../database/db';
import { emailService } from '../services/email.service';
import { config } from '../config/environment';

const router = Router();

// Strict rate limiter for sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registration
 *               - password
 *             properties:
 *               registration:
 *                 type: string
 *                 example: "12345"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  authLimiter,
  [
    body('registration')
      .isLength({ min: 1 })
      .withMessage('Matrícula é obrigatória'),
    body('password').isLength({ min: 1 }).withMessage('Senha é obrigatória'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array(),
        });
      }

      const { registration, password } = req.body;

      // Busca usuário no banco
      const user = await db('users').where({ registration }).first();

      if (!user || !user.is_active) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Matrícula ou senha incorretos',
        });
      }

      // Verifica senha
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Matrícula ou senha incorretos',
        });
      }

      // Parse roles se for string (JSON do PostgreSQL)
      let roles = user.roles;
      if (typeof roles === 'string') {
        try {
          roles = JSON.parse(roles);
        } catch (e) {
          roles = ['user'];
        }
      }

      // Gera tokens usando config
      const accessToken = jwt.sign(
        { id: user.id, registration: user.registration, roles: roles },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign({ id: user.id }, config.jwt.secret, {
        expiresIn: '30d',
      });

      // Retorna usuário sem senha
      const { password_hash: _, ...userWithoutPassword } = user;
      userWithoutPassword.roles = roles;

      res.json({
        accessToken,
        refreshToken,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao fazer login',
      });
    }
  }
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post(
  '/refresh',
  [
    body('refreshToken')
      .isLength({ min: 1 })
      .withMessage('Refresh token é obrigatório'),
  ],
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      // Verifica token usando config
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.secret
      ) as jwt.JwtPayload;

      // Busca usuário para pegar dados atuais (como roles)
      const user = await db('users').where({ id: decoded.id }).first();

      if (!user) {
        return res.status(401).json({
          error: 'Token inválido',
          message: 'Usuário não encontrado',
        });
      }

      let roles = user.roles;
      if (typeof roles === 'string') {
        try {
          roles = JSON.parse(roles);
        } catch (e) {
          roles = ['user'];
        }
      }

      // Novo access token usando config
      const accessToken = jwt.sign(
        { id: user.id, registration: user.registration, roles: roles },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      res.json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        error: 'Token inválido',
      });
    }
  }
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post(
  '/logout',
  [
    body('refreshToken')
      .isLength({ min: 1 })
      .withMessage('Refresh token é obrigatório'),
  ],
  async (req: Request, res: Response) => {
    // TODO: Se usar Redis ou Blacklist no banco, revogar o token aqui
    res.json({ message: 'Logout realizado com sucesso' });
  }
);

/**
 * @swagger
 * /auth/request-access:
 *   post:
 *     summary: Request credentials for first access or lost password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registration
 *             properties:
 *               registration:
 *                 type: string
 *                 description: SIAPE registration number
 *     responses:
 *       200:
 *         description: Success message
 *       404:
 *         description: SIAPE not found in allowed list
 */
router.post(
  '/request-access',
  authLimiter,
  [
    body('registration')
      .isLength({ min: 4, max: 20 })
      .withMessage('Matrícula SIAPE inválida')
      .matches(/^[0-9]+$/)
      .withMessage('Matrícula deve conter apenas números'),
  ],
  async (req: Request, res: Response) => {
    try {
      const { registration } = req.body;

      // 1. Procurar usuário pelo SIAPE
      const user = await db('users').where({ registration }).first();

      if (!user) {
        return res.status(404).json({
          error: 'Acesso negado',
          message:
            'Esta matrícula SIAPE não está autorizada a acessar o sistema.',
        });
      }

      // 2. Gerar senha aleatória de 8 caracteres
      const rawPassword = crypto.randomBytes(4).toString('hex'); // 8 caracteres hex
      const hashedPassword = await bcrypt.hash(rawPassword, 12);

      // 3. Atualizar no banco
      await db('users').where({ id: user.id }).update({
        password_hash: hashedPassword,
        updated_at: db.fn.now(),
      });

      // 4. Enviar e-mail
      await emailService.sendPasswordEmail(user.email, user.name, rawPassword);

      res.json({
        message:
          'Uma nova senha de acesso foi gerada e enviada para o seu e-mail institucional.',
      });
    } catch (error) {
      console.error('Request access error:', error);
      res.status(500).json({
        error: 'Erro no servidor',
        message:
          'Não foi possível processar sua solicitação de acesso no momento.',
      });
    }
  }
);

export default router;
