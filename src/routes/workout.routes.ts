import { Router } from 'express';
import {
  addWorkout,
  getWorkouts,
  getWorkoutById,
  editWorkout,
  deleteWorkout,
} from '../controllers/workout.controller';
import { protect } from '../middleware/auth.middleware';
import { validateWorkout } from '../middleware/validate.middleware';

const router = Router();

// Secure all workout endpoints
router.use(protect);

router.post('/', validateWorkout, addWorkout);
router.get('/', getWorkouts);
router.get('/:id', getWorkoutById);
router.put('/:id', validateWorkout, editWorkout);
router.delete('/:id', deleteWorkout);

export default router;
