import { Router } from 'express';
import { getExercises, createCustomExercise } from '../controllers/muscle.controller';
import { protect } from '../middleware/auth.middleware';
import { supabase } from '../config/db';

const router = Router();

router.get('/test-db', async (req, res) => {
  const { data, error } = await supabase
      .from('workouts')
      .select('*, workout_exercises(*, workout_sets(*))')
      .limit(1);
  if (error) {
    res.json({ success: false, error });
  } else {
    res.json({ success: true, data: data });
  }
});

router.get('/exercises', getExercises);
router.post('/exercises', protect, createCustomExercise);

export default router;
