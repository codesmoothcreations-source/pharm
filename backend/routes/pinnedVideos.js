import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    searchVideosEnhanced,
    pinVideo,
    getPinnedVideos,
    toggleVideoVisibility,
    toggleFavorite,
    getPopularVideos,
    getVideoPreferences,
    updateVideoPreferences,
    bulkPinVideos
} from '../controllers/pinnedVideoController.js';
import { protect, authorize } from '../middleware/auth.js';

// Rate limiting middleware
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

const router = express.Router();

// Rate limiting configurations
const searchLimiter = createRateLimit(
    1 * 60 * 1000, // 1 minute
    60, // 60 requests per minute
    'Search rate limit exceeded. Please try again later.'
);

const pinLimiter = createRateLimit(
    1 * 60 * 1000, // 1 minute
    20, // 20 pin operations per minute
    'Pin rate limit exceeded. Please slow down.'
);

const bulkLimiter = createRateLimit(
    5 * 60 * 1000, // 5 minutes
    5, // 5 bulk operations per 5 minutes
    'Bulk operation rate limit exceeded. Please try again later.'
);

// Public routes (no authentication required)
router.get('/search/enhanced', searchLimiter, searchVideosEnhanced);
router.get('/popular', getPopularVideos);

// Protected routes (authentication required)
router.use(protect); // All routes below require authentication

// Video pinning and management
router.post('/pin', pinLimiter, pinVideo);
router.get('/pinned', getPinnedVideos);
router.put('/:id/toggle-visibility', pinLimiter, toggleVideoVisibility);
router.post('/:id/favorite', toggleFavorite);

// User preferences
router.get('/preferences', getVideoPreferences);
router.put('/preferences', updateVideoPreferences);

// Bulk operations
router.post('/bulk-pin', bulkLimiter, bulkPinVideos);

// Health check for logged-in users
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Video management API is operational',
        user: req.user.id,
        timestamp: new Date().toISOString()
    });
});

export default router;