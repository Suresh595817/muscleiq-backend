import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import workoutRoutes from './workout.routes';
import muscleRoutes from './muscle.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Register v1 REST API Modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/workouts', workoutRoutes);
router.use('/muscles', muscleRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;
