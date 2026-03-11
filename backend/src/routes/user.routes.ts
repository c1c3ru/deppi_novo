import { Router, Request, Response } from 'express';
import db from '../database/db';

const router = Router();

/**
 * GET /users/profile – Retorna o perfil do usuário autenticado
 */
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const user = await db('users').where({ id: req.user!.id }).first();
    if (!user || !user.is_active) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    let roles = user.roles;
    if (typeof roles === 'string') {
      try {
        roles = JSON.parse(roles);
      } catch {
        roles = ['user'];
      }
    }

    const { password_hash: _, ...safeUser } = user;
    safeUser.roles = roles;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

/**
 * PUT /users/profile – Atualiza nome e email do usuário autenticado
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });
    }

    await db('users')
      .where({ id: req.user!.id })
      .update({
        name: name.trim().substring(0, 255),
        email: email.trim().toLowerCase().substring(0, 255),
        updated_at: new Date(),
      });

    const updated = await db('users').where({ id: req.user!.id }).first();
    const { password_hash: _, ...safeUser } = updated;
    res.json({ message: 'Perfil atualizado com sucesso', user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

export default router;
