import express from 'express';
import { getRecruiterDashboard, getSeekerDashboard } from '../controllers/dashboardController.js';
import { protect, isSeeker, isRecruiter } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/seeker', protect, isSeeker, getSeekerDashboard);
router.get('/recruiter', protect, isRecruiter, getRecruiterDashboard);

export default router;