import { Router, Request, Response } from 'express';
import db from '../database/db';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /boletins/admin/all:
 *   get:
 *     summary: Get all boletins (admin)
 */
router.get(
  '/admin/all',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
      const offset = (page - 1) * limit;

      const boletinsQuery = db('boletins')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const [totalCount, boletins] = await Promise.all([
        db('boletins').count('id as count').first(),
        boletinsQuery,
      ]);

      const total = Number(totalCount?.count) || 0;

      const formattedData = boletins.map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description,
        publicationDate: b.publication_date,
        fileUrl: b.file_url,
        status: b.status,
        isFeatured: b.is_featured,
        viewCount: b.view_count,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
      }));

      res.json({
        data: formattedData,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching admin boletins:', error);
      res.status(500).json({ error: 'Erro ao buscar boletins admin' });
    }
  }
);

/**
 * @swagger
 * /boletins:
 *   get:
 *     summary: Get all boletins
 *     tags: [Boletins]
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    // Busca boletins publicados
    const boletinsQuery = db('boletins')
      .where({ status: 'published' })
      .orderBy('publication_date', 'desc')
      .limit(limit)
      .offset(offset);

    const [totalCount, boletins] = await Promise.all([
      db('boletins')
        .where({ status: 'published' })
        .count('id as count')
        .first(),
      boletinsQuery,
    ]);

    const total = Number(totalCount?.count) || 0;

    // Converte para camelCase para o frontend
    const formattedData = boletins.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      publicationDate: b.publication_date,
      fileUrl: b.file_url,
      status: b.status,
      isFeatured: b.is_featured,
      viewCount: b.view_count,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }));

    res.json({
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching boletins:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar boletins',
    });
  }
});

/**
 * @swagger
 * /boletins/{id}:
 *   get:
 *     summary: Get boletim by ID (com notícias)
 *     tags: [Boletins]
 */
router.get(
  '/:id',
  optionalAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

      const boletim = await db('boletins as b')
        .leftJoin('users as u', 'b.created_by', 'u.id')
        .select('b.*', 'u.name as authorName')
        .where({ 'b.id': id })
        .first();

      if (!boletim) {
        return res.status(404).json({ error: 'Boletim não encontrado' });
      }

      // Rascunhos só são visíveis para usuários autenticados (admin)
      if (boletim.status !== 'published' && !req.user) {
        return res.status(404).json({ error: 'Boletim não encontrado' });
      }

      // Busca notícias relacionadas
      const news = await db('news')
        .where({ boletim_id: id, is_active: true })
        .orderBy('order', 'asc');

      // Incrementa contador de visualizações
      await db('boletins').where({ id }).increment('view_count', 1);

      // Formata resposta
      const response = {
        id: boletim.id,
        title: boletim.title,
        description: boletim.description,
        content: boletim.content,
        publicationDate: boletim.publication_date,
        fileUrl: boletim.file_url,
        status: boletim.status,
        isFeatured: boletim.is_featured,
        viewCount: (boletim.view_count || 0) + 1,
        authorName: boletim.authorName || 'Equipe DEPPI',
        news: news.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          imageUrl: n.image_url,
          isMain: n.is_main,
          order: n.order,
        })),
        createdAt: boletim.created_at,
        updatedAt: boletim.updated_at,
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching boletim:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar boletim',
      });
    }
  }
);

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      content,
      publicationDate,
      fileUrl,
      status,
      isFeatured,
    } = req.body;

    if (!title || title.trim().length < 3) {
      return res
        .status(400)
        .json({ error: 'Título obrigatório (mín. 3 caracteres)' });
    }

    const validStatuses = ['draft', 'published', 'archived'];
    const safeStatus = validStatuses.includes(status) ? status : 'draft';

    const [row] = await db('boletins')
      .insert({
        title: title.trim().substring(0, 255),
        description: description?.trim().substring(0, 1000),
        content,
        publication_date: publicationDate || new Date(),
        file_url: fileUrl,
        status: safeStatus,
        is_featured: isFeatured === true,
        created_by: req.user?.id,
      })
      .returning('id');

    res.status(201).json({
      id: typeof row === 'object' ? row.id : row,
      message: 'Criado com sucesso',
    });
  } catch (error) {
    console.error('Error creating boletim:', error);
    res.status(500).json({ error: 'Erro ao criar boletim' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const {
      title,
      description,
      content,
      publicationDate,
      fileUrl,
      status,
      isFeatured,
    } = req.body;

    const validStatuses = ['draft', 'published', 'archived'];
    const safeStatus =
      status && validStatuses.includes(status) ? status : undefined;

    const updateData: Record<string, unknown> = { updated_at: new Date() };
    if (title !== undefined) updateData.title = title.trim().substring(0, 255);
    if (description !== undefined)
      updateData.description = description?.trim().substring(0, 1000);
    if (content !== undefined) updateData.content = content;
    if (publicationDate !== undefined)
      updateData.publication_date = publicationDate;
    if (fileUrl !== undefined) updateData.file_url = fileUrl;
    if (safeStatus !== undefined) updateData.status = safeStatus;
    if (isFeatured !== undefined) updateData.is_featured = isFeatured === true;

    await db('boletins').where({ id }).update(updateData);
    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    console.error('Error updating boletim:', error);
    res.status(500).json({ error: 'Erro ao atualizar boletim' });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    await db('boletins').where({ id }).delete();
    res.json({ message: 'Removido com sucesso' });
  } catch (error) {
    console.error('Error deleting boletim:', error);
    res.status(500).json({ error: 'Erro ao deletar boletim' });
  }
});

export default router;
