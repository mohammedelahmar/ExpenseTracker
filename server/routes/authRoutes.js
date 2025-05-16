import express from 'express';
import { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile,
    updatePassword,
    googleLogin,
    googleSignup,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerValidator, loginValidator } from '../middleware/validators.js';

const router = express.Router();

router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updatePassword);
router.post('/google-login', googleLogin);
router.post('/google-signup', googleSignup);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

router.post('/test-email', async (req, res) => {
  try {
    console.log('Testing email service...');
    const { email } = req.body || { email: process.env.FROM_EMAIL };
    
    console.log('Environment variables:', { 
      username: process.env.EMAIL_USERNAME,
      fromEmail: process.env.FROM_EMAIL,
      fromName: process.env.FROM_NAME
    });
    
    await sendEmail({
      to: email,
      subject: 'Test Email from Expense Tracker',
      text: 'This is a test email to verify functionality.',
      html: '<p>This is a test email to verify functionality.</p>',
    });
    
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

export default router;