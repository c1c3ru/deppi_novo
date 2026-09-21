import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../database/db';
import { logger } from '../utils/logger';

const router = Router();

// Ensure uploads directory exists
const defaultUploadDir = path.resolve(process.cwd(), 'uploads');
const uploadDir =
  process.env['UPLOADS_PATH'] ||
  (fs.existsSync('/app/uploads') ? '/app/uploads' : defaultUploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

logger.info(`Uploads directory configured at: ${uploadDir}`);

// Strict MIME whitelist (both MIME type and extension must match)
const ALLOWED = new Map<string, string[]>([
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/gif', ['.gif']],
  ['image/webp', ['.webp']],
  ['application/pdf', ['.pdf']],
  ['video/mp4', ['.mp4']],
  ['video/webm', ['.webm']],
  ['application/msword', ['.doc']],
  [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ['.docx'],
  ],
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Use crypto random to avoid predictable filenames / path traversal
    const ext = path
      .extname(file.originalname)
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '');
    const safeExt = ext.length <= 5 ? ext : '';
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    const allowedExts = ALLOWED.get(file.mimetype);
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExts && allowedExts.includes(ext)) {
      return cb(null, true);
    }
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
  },
});

/**
 * POST /upload/file – single file upload (requires auth, applied at route level in index.ts)
 */
router.post(
  '/file',
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
      }

      const { relatedId, type } = req.body;
      const user_id = (req as any).user?.id || null;

      const [uploadRecord] = await db('uploads')
        .insert({
          filename: req.file.filename,
          original_name: req.file.originalname,
          mime_type: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          url: `/uploads/${req.file.filename}`,
          type: type || 'file',
          uploaded_by: user_id,
          related_boletim_id: relatedId || null,
        })
        .returning('*');

      res.json(uploadRecord);
    } catch (error) {
      logger.error('Upload error:', error);
      res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
    }
  }
);

/**
 * POST /upload/multiple – multiple files upload (requires auth, applied at route level in index.ts)
 */
router.post(
  '/multiple',
  upload.array('files', 10),
  async (req: Request, res: Response) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
      }

      const { relatedId, type } = req.body;
      const user_id = (req as any).user?.id || null;

      const results = await Promise.all(
        (req.files as Express.Multer.File[]).map(async (file) => {
          const [id] = await db('uploads')
            .insert({
              filename: file.filename,
              original_name: file.originalname,
              mime_type: file.mimetype,
              size: file.size,
              path: file.path,
              url: `/uploads/${file.filename}`,
              type: type || 'file',
              uploaded_by: user_id,
              related_boletim_id: relatedId || null,
            })
            .returning('*');
          return id;
        })
      );

      res.json({ files: results, count: results.length });
    } catch (error) {
      logger.error('Multiple upload error:', error);
      res.status(500).json({ error: 'Erro ao fazer upload dos arquivos' });
    }
  }
);

/**
 * GET /upload/boletim/:boletimId – list attachments for a boletim
 */
router.get('/boletim/:boletimId', async (req: Request, res: Response) => {
  try {
    const { boletimId } = req.params;
    const attachments = await db('uploads')
      .where({ related_boletim_id: boletimId, is_active: true })
      .orderBy('created_at', 'desc');

    res.json(attachments);
  } catch (error) {
    logger.error('Error listing attachments:', error);
    res.status(500).json({ error: 'Erro ao listar anexos' });
  }
});

/**
 * DELETE /upload/:id – delete (soft delete) an attachment
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db('uploads').where({ id }).update({ is_active: false });
    res.json({ success: true, message: 'Anexo removido' });
  } catch (error) {
    logger.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Erro ao remover anexo' });
  }
});

// Multer error handler
router.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (
    err instanceof multer.MulterError ||
    err.message?.includes('não permitido')
  ) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

export default router;
