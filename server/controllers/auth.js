import crypto from 'crypto';
import User from '../models/User.js';
import Task from '../models/Task.js'; // <-- CRITICAL FIX: Missing Import Added
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/sendEmail.js'; 

// @desc    Register user
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({ name, email, password, phone });

    const welcomeText = `Hello ${user.name},

Welcome to Witty HandUp System! 

We are thrilled to have you on board. Witty HandUp is designed to help you seamlessly delegate tasks and assist your neighbors.

You can now log in to start posting tasks, or browse the dashboard to see what the community needs help with today.

Go to Dashboard: https://wittyhandupsystem.vercel.app/

If you have any questions, simply reply to this email. We're always here to help.

Best regards,
The Witty HandUp System Team`;

    await sendEmail(user.email, 'Welcome to Witty HandUp!', welcomeText);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        role: user.role 
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Registration failed: ' + err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role, 
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed: ' + err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone !== undefined) user.phone = req.body.phone;

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'There is no user with that email' });
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const emailText = `Hello ${user.name},

You are receiving this email because you (or someone else) requested a password reset for your Witty HandUp account.

Please click the link below to reset your password:
${resetUrl}

If you did not request this, please ignore this email and your password will remain unchanged.

This link will expire in 10 minutes.`;

    try {
      await sendEmail(user.email, 'Password Reset Request', emailText);
      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // Fetch reviews (Tasks where this user was the helper and it was rated)
    const reviews = await Task.find({
      helper: req.user._id,
      isRated: true
    })
    .populate('requester', 'name')
    .select('title requester ratingValue createdAt updatedAt')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        rating: req.user.rating || 0,
        numReviews: req.user.numReviews || 0,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
        reviews: reviews 
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Failed to fetch profile: ' + err.message,
    });
  }
};
