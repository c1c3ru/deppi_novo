import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/profile', (req: Request, res: Response) => {
  // TODO: Get user from JWT token
  res.json({
    id: 1,
    registration: '12345',
    name: 'Usuário Teste',
    email: 'teste@ifce.edu.br',
    roles: ['user']
  });
});

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', (req: Request, res: Response) => {
  // TODO: Update user profile
  res.json({
    message: 'Perfil atualizado com sucesso',
    user: {
      id: 1,
      registration: '12345',
      name: req.body.name || 'Usuário Teste',
      email: req.body.email || 'teste@ifce.edu.br',
      roles: ['user']
    }
  });
});

export default router;
