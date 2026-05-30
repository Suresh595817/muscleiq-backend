import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  readAllNotifications,
  deleteNotification,
} from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', readAllNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
