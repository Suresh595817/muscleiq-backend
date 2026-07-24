import { Router } from 'express';
import { getExercises, createCustomExercise } from '../controllers/muscle.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/exercises', getExercises);
router.post('/exercises', protect, createCustomExercise);

export default router;
