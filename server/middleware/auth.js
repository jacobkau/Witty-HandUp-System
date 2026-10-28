import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verifies JWT token and sets req.user
export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized - no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User belonging to this token no longer exists' });
    }
    
    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    res.status(401).json({ success: false, error: 'Not authorized - invalid token' });
  }
};

// FIXED: Admin authorization middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied - Admin privileges required',
    });
  }
};
