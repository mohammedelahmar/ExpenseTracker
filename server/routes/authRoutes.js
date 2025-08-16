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

// Removed dev-only test email route for production

// Optional: lightweight health for auth-only concerns (no DB ops)
// Kept minimal; full health is at /api/health in app.js

export default router;