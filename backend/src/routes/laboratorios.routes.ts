import { Router } from 'express';
import { laboratorioController } from '../controllers/laboratorios.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', laboratorioController.getAll);
router.get('/:id', laboratorioController.getById);
router.post('/', authMiddleware, laboratorioController.create);
router.put('/:id', authMiddleware, laboratorioController.update);
router.delete('/:id', authMiddleware, laboratorioController.delete);

export default router;
