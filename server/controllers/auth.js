import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import emailjs from '@emailjs/nodejs';

// ---------------------------------------------------------
// HELPER: Send Welcome Email via EmailJS
// ---------------------------------------------------------
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        
        <!-- Header -->
        <div style="background-color: #2563eb; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">💁 Witty HandUp System</h1>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Welcome aboard, ${userName}!</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for joining our community. We're thrilled to have you on board. 
            Witty HandUp is designed to help you seamlessly delegate tasks and assist your neighbors.
          </p>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            You can now log in to start posting tasks, or browse the dashboard to see what the community needs help with today.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://wittyhandupsystem.vercel.app/" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
              Go to Dashboard
            </a>
          </div>

          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-top: 32px;">
            If you have any questions, simply reply to this email. We're always here to help.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Witty Highbrow Technologies. All rights reserved.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0 0;">
            This email was sent to ${userEmail} because you registered on Witty HandUp.
          </p>
        </div>
      </div>
    `;

    const templateParams = {
      to_email: userEmail,
      from_name: 'Witty HandUp Team',
      message: htmlMessage, 
    };

    // Send via EmailJS
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY, 
      }
    );

    console.log(`Welcome email sent successfully to ${userEmail}:`, response.status);
  } catch (err) {
    // We log the error, but DO NOT throw it. 
    // If the email fails, we still want the user registration to succeed.
    console.error('EmailJS Error:', err);
  }
};

// ---------------------------------------------------------
// CONTROLLERS
// ---------------------------------------------------------

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    await sendWelcomeEmail(user.email, user.name);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Registration failed: ' + err.message,
    });
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
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed: ' + err.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Failed to fetch profile: ' + err.message,
    });
  }
};
