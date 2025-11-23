import express from 'express';
import {
    getAllCauses,
    getCausesByCategory,
    getSingleCause,
    createCause,
    updateCause,
    deleteCause,
    getCauseCategories
} from '../controllers/causeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.route('/')
    .get(getAllCauses);

router.route('/categories')
    .get(getCauseCategories);

router.route('/category/:category')
    .get(getCausesByCategory);

router.route('/:id')
    .get(getSingleCause);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .post(createCause);

router.route('/:id')
    .put(updateCause)
    .delete(deleteCause);

export default router;