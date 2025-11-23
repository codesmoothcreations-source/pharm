import axios from 'axios';

/**
 * Enhanced YouTube API search with comprehensive options
 */
const searchYouTubeAPI = async (options) => {
    const {
        query,
        maxResults = 25,
        order = 'relevance',
        publishedAfter = null,
        relevanceLanguage = 'en',
        videoDuration = 'any',
        videoLicense = 'any'
    } = options;

    // Ensure we have an API key
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        throw new Error('YouTube API key not configured');
    }

    const params = {
        part: 'snippet,contentDetails,statistics',
        q: query + ' education tutorial university lecture',
        type: 'video',
        maxResults: Math.min(maxResults, 50), // YouTube API limit
        order,
        key: apiKey,
        relevanceLanguage,
        videoDuration,
        videoLicense
    };

    // Add date filter if specified
    if (publishedAfter) {
        params.publishedAfter = publishedAfter.toISOString();
    }

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params,
            timeout: 10000 // 10 second timeout
        });

        // Additional data fetch for statistics if needed
        if (response.data.items && response.data.items.length > 0) {
            const videoIds = response.data.items.map(item => item.id.videoId).join(',');
            
            try {
                const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                    params: {
                        part: 'statistics,contentDetails',
                        id: videoIds,
                        key: apiKey
                    },
                    timeout: 10000
                });

                // Merge statistics with search results
                const statsMap = new Map();
                statsResponse.data.items.forEach(video => {
                    statsMap.set(video.id, video);
                });

                response.data.items = response.data.items.map(item => ({
                    ...item,
                    statistics: statsMap.get(item.id.videoId)?.statistics || {},
                    contentDetails: statsMap.get(item.id.videoId)?.contentDetails || {}
                }));
            } catch (statsError) {
                console.warn('Could not fetch video statistics:', statsError.message);
                // Continue with basic data if stats fail
            }
        }

        return response;
    } catch (error) {
        console.error('YouTube API error:', error.response?.data || error.message);
        
        if (error.response?.status === 403) {
            if (error.response?.data?.error?.errors?.[0]?.reason === 'quotaExceeded') {
                throw new Error('YouTube API quota exceeded. Please try again later.');
            }
            throw new Error('YouTube API access denied. Please check API key permissions.');
        }
        
        if (error.response?.status === 400) {
            throw new Error('Invalid search parameters. Please check your query.');
        }
        
        throw new Error(`YouTube API error: ${error.response?.data?.error?.message || error.message}`);
    }
};

/**
 * Get video details by ID
 */
const getVideoDetails = async (videoId) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        throw new Error('YouTube API key not configured');
    }

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'snippet,contentDetails,statistics',
                id: videoId,
                key: apiKey
            },
            timeout: 10000
        });

        if (!response.data.items || response.data.items.length === 0) {
            throw new Error('Video not found');
        }

        return response.data.items[0];
    } catch (error) {
        console.error('Error fetching video details:', error.message);
        throw error;
    }
};

/**
 * Search for related videos based on a video ID
 */
const getRelatedVideos = async (videoId, maxResults = 12) => {
    try {
        // First get the video details
        const videoDetails = await getVideoDetails(videoId);
        
        // Extract tags and description for related search
        const searchQuery = [
            ...videoDetails.snippet.tags?.slice(0, 5) || [],
            videoDetails.snippet.title.split(' ').slice(0, 4).join(' ')
        ].join(' ');

        // Search for related videos
        const response = await searchYouTubeAPI({
            query: searchQuery,
            maxResults,
            order: 'relevance'
        });

        // Filter out the original video
        const relatedVideos = response.data.items.filter(
            item => item.id.videoId !== videoId
        );

        return {
            ...response,
            data: {
                ...response.data,
                items: relatedVideos
            }
        };
    } catch (error) {
        console.error('Error fetching related videos:', error.message);
        throw error;
    }
};

/**
 * Validate YouTube API key
 */
const validateApiKey = async () => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        return { valid: false, error: 'API key not configured' };
    }

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                part: 'snippet',
                id: 'UC4R8DWoMoI7CAwX8_LjQHig', // YouTube's own channel ID
                key: apiKey
            },
            timeout: 5000
        });

        return { valid: true, response: response.data };
    } catch (error) {
        return { 
            valid: false, 
            error: error.response?.data?.error?.message || error.message 
        };
    }
};

/**
 * Extract video metadata from search results
 */
const extractVideoMetadata = (videoData) => {
    const duration = videoData.contentDetails?.duration;
    const stats = videoData.statistics || {};
    
    // Parse YouTube duration format (PT4M13S -> 4:13)
    const parseDuration = (durationString) => {
        if (!durationString) return null;
        const match = durationString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return null;
        
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return {
        videoId: videoData.id?.videoId || videoData.id,
        title: videoData.snippet?.title,
        description: videoData.snippet?.description,
        channelTitle: videoData.snippet?.channelTitle,
        publishedAt: videoData.snippet?.publishedAt,
        thumbnail: videoData.snippet?.thumbnails?.medium?.url,
        highQualityThumbnail: videoData.snippet?.thumbnails?.high?.url,
        defaultThumbnail: videoData.snippet?.thumbnails?.default?.url,
        url: `https://www.youtube.com/watch?v=${videoData.id?.videoId || videoData.id}`,
        duration: parseDuration(duration),
        durationISO: duration,
        viewCount: stats.viewCount,
        likeCount: stats.likeCount,
        dislikeCount: stats.dislikeCount,
        commentCount: stats.commentCount,
        tags: videoData.snippet?.tags || [],
        categoryId: videoData.snippet?.categoryId,
        liveBroadcastContent: videoData.snippet?.liveBroadcastContent,
        defaultLanguage: videoData.snippet?.defaultLanguage,
        defaultAudioLanguage: videoData.snippet?.defaultAudioLanguage,
        licensedContent: videoData.contentDetails?.licensedContent,
        projection: videoData.contentDetails?.projection
    };
};

/**
 * Health check for YouTube API
 */
const youtubeApiHealthCheck = async () => {
    try {
        const validation = await validateApiKey();
        
        if (!validation.valid) {
            return {
                status: 'unhealthy',
                message: validation.error,
                timestamp: new Date().toISOString()
            };
        }

        // Try a minimal search to verify quota
        await searchYouTubeAPI({
            query: 'test',
            maxResults: 1
        });

        return {
            status: 'healthy',
            message: 'YouTube API is operational',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            message: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

export { 
    searchYouTubeAPI,
    getVideoDetails,
    getRelatedVideos,
    validateApiKey,
    extractVideoMetadata,
    youtubeApiHealthCheck
 };