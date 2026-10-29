import express from 'express';
import { getStats, getAllUsers } from '../controllers/admin.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Access denied. Admin only.' });
  }
};

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getAllUsers);

export default router;
