import { Router } from 'express';
import { getExercises, createCustomExercise } from '../controllers/muscle.controller';
import { protect } from '../middleware/auth.middleware';
import { supabase } from '../config/db';

const router = Router();

router.get('/test-db', async (req, res) => {
  const { data, error } = await supabase.from('exercises').insert([{ name: 'TestDB-' + Date.now(), primary_muscle: 'Chest', is_custom: true }]).select();
  if (error) {
    res.json({ success: false, error });
  } else {
    // Clean up
    await supabase.from('exercises').delete().eq('id', data[0].id);
    res.json({ success: true, message: 'DB Insert works! Service key is active.' });
  }
});

router.get('/exercises', getExercises);
router.post('/exercises', protect, createCustomExercise);

export default router;
