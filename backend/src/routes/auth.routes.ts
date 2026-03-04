import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db';

const router = Router();

// JWT secret - TODO: Move to environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
router.post('/login', [
  body('registration').isLength({ min: 1 }).withMessage('Matrícula é obrigatória'),
  body('password').isLength({ min: 1 }).withMessage('Senha é obrigatória'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { registration, password } = req.body;

    // Busca usuário no banco
    const user = await db('users').where({ registration }).first();

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Matrícula ou senha incorretos'
      });
    }

    // Verifica senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Matrícula ou senha incorretos'
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

    // Gera tokens
    const accessToken = jwt.sign(
      { id: user.id, registration: user.registration, roles: roles },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Retorna usuário sem senha
    const { password_hash: _, ...userWithoutPassword } = user;
    userWithoutPassword.roles = roles;

    res.json({
      accessToken,
      refreshToken,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao fazer login'
    });
  }
});

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
router.post('/refresh', [
  body('refreshToken').isLength({ min: 1 }).withMessage('Refresh token é obrigatório'),
], async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    // Verifica token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;

    // Busca usuário para pegar dados atuais (como roles)
    const user = await db('users').where({ id: decoded.id }).first();

    if (!user) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Usuário não encontrado'
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

    // Novo access token
    const accessToken = jwt.sign(
      { id: user.id, registration: user.registration, roles: roles },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: 'Token inválido'
    });
  }
});

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
router.post('/logout', [
  body('refreshToken').isLength({ min: 1 }).withMessage('Refresh token é obrigatório'),
], async (req: Request, res: Response) => {
  // TODO: Se usar Redis ou Blacklist no banco, revogar o token aqui
  res.json({ message: 'Logout realizado com sucesso' });
});

export default router;
