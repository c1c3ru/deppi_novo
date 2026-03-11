import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
router.post('/file', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
  }
});

/**
 * POST /upload/multiple – multiple files upload (requires auth, applied at route level in index.ts)
 */
router.post(
  '/multiple',
  upload.array('files', 10),
  (req: Request, res: Response) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
      }

      const files = (req.files as Express.Multer.File[]).map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: `/uploads/${file.filename}`,
      }));

      res.json({ files, count: files.length });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({ error: 'Erro ao fazer upload dos arquivos' });
    }
  }
);

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
