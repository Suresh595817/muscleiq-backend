import { Router } from 'express';
import {
  getAllUsers,
  deleteUser,
  monitorWorkouts,
  getSystemStats,
} from '../controllers/admin.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

// Fully protected for authenticated admins only
router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/workouts', monitorWorkouts);
router.get('/stats', getSystemStats);

export default router;
