import { Router } from 'express';
import { visitController } from '../controllers/visit.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', visitController.getAll);
router.post('/', visitController.create);

// Protected routes
router.get('/:id', authMiddleware, visitController.getById);
router.patch('/:id/status', authMiddleware, visitController.updateStatus);
router.patch('/:id/labs/:lab_id', authMiddleware, visitController.updateLabAvailability);

export default router;
