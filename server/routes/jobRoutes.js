import express from 'express';
import {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    closeJob
} from '../controllers/jobController.js';
import { protect, isRecruiter } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes - Anyone can view
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected Routes - Recruiters only
router.post('/', protect, isRecruiter, createJob);
router.patch('/:id', protect, isRecruiter, updateJob);
router.delete('/:id', protect, isRecruiter, deleteJob);
router.patch('/:id/close', protect, isRecruiter, closeJob);

export default router;