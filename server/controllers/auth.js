import crypto from 'crypto';
import User from '../models/User.js';
import Task from '../models/Task.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/sendEmail.js'; 
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Auth with Google
// @route   POST /api/auth/google
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'No token provided' });
    }

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub } = ticket.getPayload();

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
     
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      user = await User.create({
        name,
        email,
        password: randomPassword,
        phone: '', 
      });
    }

    // Check if user is active 
    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account deactivated. Contact support.' });
    }

    // Generate your normal JWT
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance,
        skills: user.skills,
        rating: user.rating,
        numReviews: user.numReviews,
      },
    });

  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ success: false, error: 'Invalid Google token' });
  }
};

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

Go to Dashboard: https://wittyhandupsystem.vercel.app/

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
        role: user.role,
        walletBalance: user.walletBalance
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Registration failed: ' + err.message });
  }
};

// @desc    Login user
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
     if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Your account has been deactivated. Please contact support.' });
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
        walletBalance: user.walletBalance,
        skills: user.skills,
        rating: user.rating,
        numReviews: user.numReviews,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed: ' + err.message });
  }
};

// @desc    Update user profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.skills) user.skills = req.body.skills;

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
        walletBalance: updatedUser.walletBalance,
        skills: updatedUser.skills,
        rating: updatedUser.rating,
        numReviews: updatedUser.numReviews,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Forgot Password
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

You are receiving this email because you (or someone else) requested a password reset.

Please click the link below:
${resetUrl}

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

    res.status(200).json({ success: true, message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const reviews = await Task.find({ helper: req.user._id, isRated: true })
      .populate('requester', 'name') 
      .select('title requester ratingValue createdAt updatedAt')
      .sort({ updatedAt: -1 });

    const completedTasks = await Task.find({ helper: req.user._id, status: 'completed' });
    const totalEarnings = completedTasks.reduce((sum, task) => sum + (task.price || 0), 0);

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        walletBalance: totalEarnings, 
        skills: req.user.skills || [],
        rating: req.user.rating || 0,
        numReviews: req.user.numReviews || 0,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
        reviews: reviews 
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
