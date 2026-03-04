import { Router, Request, Response } from 'express';
import db from '../database/db';

const router = Router();

/**
 * @swagger
 * /boletins:
 *   get:
 *     summary: Get all boletins
 *     tags: [Boletins]
 *     responses:
 *       200:
 *         description: List of boletins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Boletim'
 *                 pagination:
 *                   type: object
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Busca boletins publicados
    const boletinsQuery = db('boletins')
      .where({ status: 'published' })
      .orderBy('publication_date', 'desc')
      .limit(limit)
      .offset(offset);

    const [totalCount, boletins] = await Promise.all([
      db('boletins').where({ status: 'published' }).count('id as count').first(),
      boletinsQuery
    ]);

    const total = Number(totalCount?.count) || 0;

    // Converte para camelCase para o frontend
    const formattedData = boletins.map(b => ({
      id: b.id,
      title: b.title,
      description: b.description,
      publicationDate: b.publication_date,
      fileUrl: b.file_url,
      status: b.status,
      isFeatured: b.is_featured,
      viewCount: b.view_count,
      createdAt: b.created_at,
      updatedAt: b.updated_at
    }));

    res.json({
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching boletins:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar boletins'
    });
  }
});

/**
 * @swagger
 * /boletins/{id}:
 *   get:
 *     summary: Get boletim by ID (com notícias)
 *     tags: [Boletins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Boletim details
 *       404:
 *         description: Boletim not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const boletim = await db('boletins').where({ id }).first();

    if (!boletim) {
      return res.status(404).json({
        error: 'Boletim não encontrado'
      });
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
      news: news.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        imageUrl: n.image_url,
        isMain: n.is_main,
        order: n.order
      })),
      createdAt: boletim.created_at,
      updatedAt: boletim.updated_at
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching boletim:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar boletim'
    });
  }
});

export default router;
