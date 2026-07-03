import express from 'express';
import { registerUser, loginUser, logoutUser, refreshToken } from "../controllers/authController.js";
import { protect } from '../middleware/authMiddleware.js';
import { sendOtp, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);

// Secure Routes
router.get('/me', protect, (req, res) => {
    res.json({
        user: req.user
    });
});
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.post('/send-otp', sendOtp);
router.post('/reset-password', resetPassword);

export default router;