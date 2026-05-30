import { Router } from 'express';
import { getExercises, createCustomExercise } from '../controllers/muscle.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/exercises', getExercises);
router.post('/exercises', createCustomExercise);

export default router;
