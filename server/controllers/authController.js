//Auth logic (signup, login)
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs'; // Add this import
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto'; // Add this import
import { sendEmail } from '../services/emailService.js'; // Add this import

// @desc   Register new user
// @route  POST /api/users/register
const registerUser = asyncHandler(async(req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if(existingUser) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    if(user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc   Auth user & get token
// @route  POST /api/users/login
const loginUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if(user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            token: generateToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc   Get user profile
// @route  GET /api/users/profile
const getUserProfile = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);
    
    if(user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc   Update user profile
// @route  PUT /api/users/profile
const updateUserProfile = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);
    
    if(user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        
        const updatedUser = await user.save();
        
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            token: generateToken(updatedUser._id)
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc   Update user password
// @route  PUT /api/users/password
const updatePassword = asyncHandler(async(req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if(!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if(!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
});



const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc   Authenticate user with Google
// @route  POST /api/users/google-login
const googleLogin = asyncHandler(async(req, res) => {
  const { token } = req.body;
  
  if (!token) {
    res.status(400);
    throw new Error('Google token is required');
  }
  
  try {
    console.log('Verifying Google token for client ID:', process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name } = payload;
    
    console.log('Google authentication successful for:', email);
    
    // Find user by email
    let user = await User.findOne({ email });
    
    // If user doesn't exist but trying to login, create a new user account
    if (!user) {
      // Create random username from email
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      user = await User.create({
        username,
        email,
        password: hashedPassword,
        isGoogleAccount: true
      });
      
      console.log('New user created for Google login:', email);
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401);
    throw new Error(`Google authentication failed: ${error.message}`);
  }
});

// @desc   Register user with Google
// @route  POST /api/users/google-signup
const googleSignup = asyncHandler(async(req, res) => {
  const { token } = req.body;
  
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User already exists, just log them in
      return res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: generateToken(user._id)
      });
    }
    
    // Create new user
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    const randomPassword = Math.random().toString(36).slice(-10);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);
    
    user = await User.create({
      username,
      email,
      password: hashedPassword,
      isGoogleAccount: true
    });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(401);
    throw new Error('Invalid Google token');
  }
});

// @desc   Forgot password - generate reset token
// @route  POST /api/users/forgot-password
const forgotPassword = asyncHandler(async(req, res) => {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('No account with that email address exists');
    }

    // Generate random token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set token and expiry on user model
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Email message
    const message = `
        You are receiving this email because you (or someone else) has requested to reset your password.
        Please click on the following link, or paste it into your browser to complete the process:
        ${resetUrl}
        
        If you did not request this, please ignore this email and your password will remain unchanged.
    `;

    try {
        // Send actual email
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            text: message,
            html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
        });
        
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(500);
        throw new Error('Email could not be sent');
    }
});

// @desc   Reset password
// @route  PUT /api/users/reset-password/:resetToken
const resetPassword = asyncHandler(async(req, res) => {
    // Get token from params
    const resetToken = req.params.resetToken;
    const { password } = req.body;

    // Hash the token from the URL
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find the user with the valid token and token not expired
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() } // Token still valid
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired password reset token');
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully' });
});

// Export them along with your other controllers
// Change the export statement to match the actual function name
export { 
    registerUser, loginUser, getUserProfile, updateUserProfile, 
    updatePassword, googleLogin, googleSignup, 
    forgotPassword, resetPassword 
};