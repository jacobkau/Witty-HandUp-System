import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notifications.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.get('/', protect, getNotifications);
router.put('/read', protect, markAsRead);

export default router;
