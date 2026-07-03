import express from 'express';
import {
    applyJob,
    getJobApplicants,
    getMyApplications,
    updateStatus
} from '../controllers/applicationController.js';
import { protect, isSeeker, isRecruiter } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// seeker routes
router.get('/mine', protect, isSeeker, getMyApplications);
router.post('/:jobId', protect, isSeeker, upload.single('resume'), applyJob);

// recruiter routes
router.get('/job/:jobId', protect, isRecruiter, getJobApplicants);
router.patch('/:id/status', protect, isRecruiter, updateStatus);

export default router;