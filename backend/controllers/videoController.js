import axios from 'axios';
import PastQuestion from '../models/PastQuestion.js';
import { getMockVideos } from '../utils/mockVideoService.js';

/**
 * @desc    Search videos related to course
 * @route   GET /api/videos/search
 * @access  Public
 */
const searchVideos = async (req, res) => {
    try {
        let { query, courseCode, maxResults = 12 } = req.query;

        // Allow empty query for general search
        if (!query && !courseCode) {
            query = 'pharmacy education tutorial';
        }

        // Build search query
        let searchQuery = query;
        if (courseCode && !query) {
            // If only course code provided, search by course code
            searchQuery = `${courseCode} education tutorial`;
        } else if (courseCode && query) {
            // If both provided, combine them
            searchQuery = `${courseCode} ${query}`;
        }

        console.log('Searching videos for query:', searchQuery);
        console.log('Course code:', courseCode);
        console.log('Max results:', maxResults);

        // Use mock service for reliable results
        const mockResponse = getMockVideos(searchQuery, 'all', 'all', parseInt(maxResults));
        
        // Return the response in the expected format
        res.json(mockResponse);
        
    } catch (error) {
        console.error('Video search error:', error.message);
        
        // Always return a valid response even on error
        const fallbackResponse = getMockVideos('education', 'all', 'all', 12);
        res.json(fallbackResponse);
    }
};

/**
 * @desc    Add video to past question
 * @route   POST /api/videos/past-question/:id
 * @access  Private (Admin)
 */
const addVideoToPastQuestion = async (req, res) => {
    try {
        const { videoId, title, url, channelTitle, publishedAt } = req.body;

        const pastQuestion = await PastQuestion.findById(req.params.id);

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        // Add video to past question
        pastQuestion.youtubeLinks.push({
            videoId,
            title,
            url,
            channelTitle,
            publishedAt: new Date(publishedAt)
        });

        await pastQuestion.save();

        res.json({
            success: true,
            data: pastQuestion,
            message: 'Video added to past question successfully'
        });
    } catch (error) {
        console.error('Add video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding video to past question',
            error: error.message
        });
    }
};

export { 
    searchVideos,
    addVideoToPastQuestion
 };