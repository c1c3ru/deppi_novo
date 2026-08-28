import { Router } from 'express';
import { visitController } from '../controllers/visit.controller';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../middleware/auth.middleware';

const router = Router();

// Public routes (dados sensíveis são filtrados no controller para anônimos)
router.get('/', optionalAuthMiddleware, visitController.getAll);
// Precisa vir antes de '/:id' — senão Express trataria "realizadas" como um :id.
router.get('/realizadas', optionalAuthMiddleware, visitController.getRealizadas);
router.post('/', visitController.create);

// Protected routes
router.get('/:id', authMiddleware, visitController.getById);
router.patch('/:id/status', authMiddleware, visitController.updateStatus);
router.patch(
  '/:id/labs/:lab_id',
  authMiddleware,
  visitController.updateLabAvailability
);
router.post('/:id/labs', authMiddleware, visitController.addLab);

export default router;
