import { Router, Request, Response } from 'express';
import db from '../database/db';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../middleware/auth.middleware';

const router = Router();

function formatEdicao(e: any) {
  return {
    id: e.id,
    volume: e.volume,
    ano: e.ano,
    title: e.title,
    description: e.description,
    coverImage: e.cover_image,
    status: e.status,
    publishedAt: e.published_at,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  };
}

function formatArtigo(a: any) {
  return {
    id: a.id,
    edicaoId: a.edicao_id,
    title: a.title,
    summary: a.summary,
    authors: a.authors,
    content: a.content,
    order: a.order,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  };
}

/**
 * @swagger
 * /revista/edicoes/admin/all:
 *   get:
 *     summary: Get all revista editions (admin)
 */
router.get(
  '/edicoes/admin/all',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const edicoes = await db('revista_edicoes')
        .orderBy('ano', 'desc')
        .orderBy('volume', 'desc');
      res.json({ data: edicoes.map(formatEdicao) });
    } catch (error) {
      console.error('Error fetching admin edicoes:', error);
      res.status(500).json({ error: 'Erro ao buscar edições' });
    }
  }
);

/**
 * @swagger
 * /revista/edicoes:
 *   get:
 *     summary: Get all published revista editions
 *     tags: [Revista]
 */
router.get('/edicoes', async (req: Request, res: Response) => {
  try {
    const edicoes = await db('revista_edicoes')
      .where({ status: 'published' })
      .orderBy('ano', 'desc')
      .orderBy('volume', 'desc');
    res.json({ data: edicoes.map(formatEdicao) });
  } catch (error) {
    console.error('Error fetching edicoes:', error);
    res.status(500).json({ error: 'Erro ao buscar edições' });
  }
});

/**
 * @swagger
 * /revista/edicoes/{id}:
 *   get:
 *     summary: Get a revista edition with its articles
 *     tags: [Revista]
 */
router.get(
  '/edicoes/:id',
  optionalAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

      const edicao = await db('revista_edicoes').where({ id }).first();
      if (!edicao) {
        return res.status(404).json({ error: 'Edição não encontrada' });
      }
      if (edicao.status !== 'published' && !req.user) {
        return res.status(404).json({ error: 'Edição não encontrada' });
      }

      const artigos = await db('revista_artigos')
        .where({ edicao_id: id })
        .orderBy('order', 'asc');

      res.json({
        ...formatEdicao(edicao),
        artigos: artigos.map(formatArtigo),
      });
    } catch (error) {
      console.error('Error fetching edicao:', error);
      res.status(500).json({ error: 'Erro ao buscar edição' });
    }
  }
);

router.post('/edicoes', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { volume, ano, title, description, coverImage, status } = req.body;

    if (!volume || !ano) {
      return res.status(400).json({ error: 'Volume e ano são obrigatórios' });
    }
    if (!title || title.trim().length < 3) {
      return res
        .status(400)
        .json({ error: 'Título obrigatório (mín. 3 caracteres)' });
    }

    const validStatuses = ['draft', 'published'];
    const safeStatus = validStatuses.includes(status) ? status : 'draft';

    const [row] = await db('revista_edicoes')
      .insert({
        volume: Number(volume),
        ano: Number(ano),
        title: title.trim().substring(0, 500),
        description: description?.trim(),
        cover_image: coverImage,
        status: safeStatus,
        published_at: safeStatus === 'published' ? new Date() : null,
        created_by: req.user?.id,
      })
      .returning('id');

    res.status(201).json({
      id: typeof row === 'object' ? row.id : row,
      message: 'Edição criada com sucesso',
    });
  } catch (error: any) {
    if (error?.code === '23505') {
      return res
        .status(409)
        .json({ error: 'Já existe uma edição com este volume e ano' });
    }
    console.error('Error creating edicao:', error);
    res.status(500).json({ error: 'Erro ao criar edição' });
  }
});

router.put(
  '/edicoes/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

      const { volume, ano, title, description, coverImage, status } = req.body;

      const current = await db('revista_edicoes').where({ id }).first();
      if (!current) {
        return res.status(404).json({ error: 'Edição não encontrada' });
      }

      const validStatuses = ['draft', 'published'];
      const safeStatus =
        status && validStatuses.includes(status) ? status : undefined;

      const updateData: Record<string, unknown> = { updated_at: new Date() };
      if (volume !== undefined) updateData.volume = Number(volume);
      if (ano !== undefined) updateData.ano = Number(ano);
      if (title !== undefined) updateData.title = title.trim().substring(0, 500);
      if (description !== undefined) updateData.description = description?.trim();
      if (coverImage !== undefined) updateData.cover_image = coverImage;
      if (safeStatus !== undefined) {
        updateData.status = safeStatus;
        if (safeStatus === 'published' && !current.published_at) {
          updateData.published_at = new Date();
        }
      }

      await db('revista_edicoes').where({ id }).update(updateData);
      res.json({ message: 'Edição atualizada com sucesso' });
    } catch (error: any) {
      if (error?.code === '23505') {
        return res
          .status(409)
          .json({ error: 'Já existe uma edição com este volume e ano' });
      }
      console.error('Error updating edicao:', error);
      res.status(500).json({ error: 'Erro ao atualizar edição' });
    }
  }
);

router.delete(
  '/edicoes/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
      await db('revista_edicoes').where({ id }).delete();
      res.json({ message: 'Edição removida com sucesso' });
    } catch (error) {
      console.error('Error deleting edicao:', error);
      res.status(500).json({ error: 'Erro ao remover edição' });
    }
  }
);

/**
 * @swagger
 * /revista/artigos/{id}:
 *   get:
 *     summary: Get a single article
 *     tags: [Revista]
 */
router.get(
  '/artigos/:id',
  optionalAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

      const artigo = await db('revista_artigos').where({ id }).first();
      if (!artigo) {
        return res.status(404).json({ error: 'Artigo não encontrado' });
      }

      const edicao = await db('revista_edicoes')
        .where({ id: artigo.edicao_id })
        .first();

      if ((!edicao || edicao.status !== 'published') && !req.user) {
        return res.status(404).json({ error: 'Artigo não encontrado' });
      }

      res.json({ ...formatArtigo(artigo), edicao: formatEdicao(edicao) });
    } catch (error) {
      console.error('Error fetching artigo:', error);
      res.status(500).json({ error: 'Erro ao buscar artigo' });
    }
  }
);

router.post(
  '/edicoes/:edicaoId/artigos',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const edicaoId = parseInt(req.params.edicaoId, 10);
      if (isNaN(edicaoId)) return res.status(400).json({ error: 'ID inválido' });

      const edicao = await db('revista_edicoes').where({ id: edicaoId }).first();
      if (!edicao) {
        return res.status(404).json({ error: 'Edição não encontrada' });
      }

      const { title, summary, authors, content, order } = req.body;

      if (!title || title.trim().length < 3) {
        return res
          .status(400)
          .json({ error: 'Título obrigatório (mín. 3 caracteres)' });
      }
      if (!content || content.trim().length < 1) {
        return res.status(400).json({ error: 'Conteúdo obrigatório' });
      }

      const [row] = await db('revista_artigos')
        .insert({
          edicao_id: edicaoId,
          title: title.trim().substring(0, 500),
          summary: summary?.trim(),
          authors: authors?.trim().substring(0, 1000),
          content,
          order: Number(order) || 0,
        })
        .returning('id');

      res.status(201).json({
        id: typeof row === 'object' ? row.id : row,
        message: 'Artigo criado com sucesso',
      });
    } catch (error) {
      console.error('Error creating artigo:', error);
      res.status(500).json({ error: 'Erro ao criar artigo' });
    }
  }
);

router.put(
  '/artigos/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

      const { title, summary, authors, content, order } = req.body;

      const updateData: Record<string, unknown> = { updated_at: new Date() };
      if (title !== undefined) updateData.title = title.trim().substring(0, 500);
      if (summary !== undefined) updateData.summary = summary?.trim();
      if (authors !== undefined)
        updateData.authors = authors?.trim().substring(0, 1000);
      if (content !== undefined) updateData.content = content;
      if (order !== undefined) updateData.order = Number(order) || 0;

      await db('revista_artigos').where({ id }).update(updateData);
      res.json({ message: 'Artigo atualizado com sucesso' });
    } catch (error) {
      console.error('Error updating artigo:', error);
      res.status(500).json({ error: 'Erro ao atualizar artigo' });
    }
  }
);

router.delete(
  '/artigos/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
      await db('revista_artigos').where({ id }).delete();
      res.json({ message: 'Artigo removido com sucesso' });
    } catch (error) {
      console.error('Error deleting artigo:', error);
      res.status(500).json({ error: 'Erro ao remover artigo' });
    }
  }
);

export default router;
