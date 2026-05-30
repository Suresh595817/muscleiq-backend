import { Router } from 'express';
import {
  getMuscleImbalanceReport,
  getAnalyticsHistory,
  getDashboardStats,
  getAIInsights,
} from '../controllers/analytics.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/imbalance', getMuscleImbalanceReport);
router.get('/insights', getAIInsights);
router.get('/history', getAnalyticsHistory);
router.get('/dashboard', getDashboardStats);

export default router;
