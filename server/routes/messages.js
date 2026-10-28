import express from 'express';
import { getMessages, sendMessage } from '../controllers/messages.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/:taskId')
  .get(protect, getMessages)
  .post(protect, sendMessage);

export default router;
