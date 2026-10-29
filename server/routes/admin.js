import express from 'express';
import { getStats, getAllUsers, toggleUserStatus, deleteUser } from '../controllers/admin.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ success: false, error: 'Access denied' });
};

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/toggle', protect, adminOnly, toggleUserStatus);
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;
