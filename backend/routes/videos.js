import express from 'express';
import { searchVideos, addVideoToPastQuestion } from '../controllers/videoController.js';
import { searchVideosEnhanced } from '../controllers/pinnedVideoController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/videos/search
 * @desc    Search YouTube videos
 * @access  Public
 */
router.get('/search', searchVideos);

/**
 * @route   GET /api/videos/search/enhanced
 * @desc    Enhanced video search with filtering
 * @access  Public
 */
router.get('/search/enhanced', searchVideosEnhanced);

/**
 * @route   POST /api/videos/pin
 * @desc    Pin a video for user
 * @access  Private
 */
router.post('/pin', protect, async (req, res) => {
  try {
    // Simple pin video implementation
    res.json({ success: true, message: 'Video pinned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error pinning video', error: error.message });
  }
});

/**
 * @route   GET /api/videos/pinned
 * @desc    Get user's pinned videos
 * @access  Private
 */
router.get('/pinned', protect, async (req, res) => {
  try {
    // Return empty array for now
    res.json({ success: true, data: [], count: 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pinned videos', error: error.message });
  }
});

/**
 * @route   POST /api/videos/past-question/:id
 * @desc    Add YouTube video to past question
 * @access  Private (Admin)
 */
router.post('/past-question/:id', protect, authorize('admin'), addVideoToPastQuestion);

export default router;