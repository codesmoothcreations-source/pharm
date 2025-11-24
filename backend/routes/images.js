import express from 'express';
import {
    uploadImage,
    getImages,
    getImage,
    updateImage,
    deleteImage,
    getMyImageStats
} from '../controllers/imageController.js';
import { protect } from '../middleware/auth.js';
import uploadImageMiddleware from '../middleware/uploadImage.js';

const router = express.Router();

/**
 * All image routes require authentication
 * Users must be logged in to upload, view, or manage images
 */
router.use(protect);

/**
 * @route   GET /api/images/stats/me
 * @desc    Get current user's image statistics
 * @access  Private
 */
router.route('/stats/me')
    .get(getMyImageStats);

/**
 * @route   GET /api/images
 * @desc    Get all images (filtered by permissions)
 * @route   POST /api/images
 * @desc    Upload new image
 * @access  Private
 */
router.route('/')
    .get(getImages)
    .post(uploadImageMiddleware.single('image'), uploadImage);

/**
 * @route   GET /api/images/:id
 * @desc    Get single image by ID
 * @route   PUT /api/images/:id
 * @desc    Update image metadata
 * @route   DELETE /api/images/:id
 * @desc    Delete image
 * @access  Private (owner only for PUT/DELETE)
 */
router.route('/:id')
    .get(getImage)
    .put(updateImage)
    .delete(deleteImage);

export default router;
