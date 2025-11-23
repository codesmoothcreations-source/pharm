import express from 'express';
import {
    getAllCourses,
    getSingleCourse,
    createCourse,
    updateCourse,
    deleteCourse
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getSingleCourse);

// Admin routes (require authentication and admin role)
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

export default router;