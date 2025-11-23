import express from 'express';
import {
    getPastQuestions,
    getPastQuestion,
    createPastQuestion,
    updatePastQuestion,
    deletePastQuestion,
    approvePastQuestion,
    downloadPastQuestion,
    getFilterOptions,
    updateQuestionMetadata
} from '../controllers/pastQuestionController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.route('/filters')
    .get(getFilterOptions);

router.route('/')
    .get(getPastQuestions);

// Public routes
router.route('/')
    .get(getPastQuestions);

router.route('/:id')
    .get(getPastQuestion);

router.route('/:id/download')
    .get(downloadPastQuestion);

// Protected routes
router.use(protect);

router.route('/')
    .post(upload.single('file'), createPastQuestion);

// PUT for metadata-only updates (no file required)
router.route('/:id/metadata')
    .put(updateQuestionMetadata);

// PUT for full updates with optional file upload
router.route('/:id')
    .put(upload.single('file'), updatePastQuestion)
    .delete(deletePastQuestion);

// Admin only routes
router.route('/:id/approve')
    .put(authorize('admin'), approvePastQuestion);

export default router;