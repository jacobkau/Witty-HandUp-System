import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  updateProfile,
  googleLogin,
  forgotPassword,
  resetPassword   
} from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/google', googleLogin);
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword); 
router.put('/resetpassword/:resettoken', resetPassword); 
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

export default router;
