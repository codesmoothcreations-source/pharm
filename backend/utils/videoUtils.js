/**
 * YouTube URL validation and parsing utilities
 */

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/**
 * Validate if a URL is a valid YouTube video URL
 */
const validateVideoURL = (url) => {
    if (!url || typeof url !== 'string') {
        return { valid: false, error: 'URL is required' };
    }

    if (!YOUTUBE_REGEX.test(url)) {
        return { valid: false, error: 'Invalid YouTube URL format' };
    }

    return { valid: true };
};

/**
 * Extract video ID from various YouTube URL formats
 */
const parseYouTubeURL = (url) => {
    if (!url || !YOUTUBE_REGEX.test(url)) {
        return null;
    }

    // Different URL patterns to extract video ID
    const patterns = [
        // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
        /v=([a-zA-Z0-9_-]{11})/,
        // Shortened URL: https://youtu.be/VIDEO_ID
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        // Embed URL: https://www.youtube.com/embed/VIDEO_ID
        /embed\/([a-zA-Z0-9_-]{11})/,
        // URL with timestamp: https://www.youtube.com/watch?v=VIDEO_ID&t=123s
        /v=([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

/**
 * Generate different YouTube URLs from video ID
 */
const generateYouTubeURLs = (videoId) => {
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return null;
    }

    return {
        watch: `https://www.youtube.com/watch?v=${videoId}`,
        embed: `https://www.youtube.com/embed/${videoId}`,
        short: `https://youtu.be/${videoId}`,
        share: `https://www.youtube.com/redirect?event=video_description&q=${videoId}`
    };
};

/**
 * Validate video metadata for pinning
 */
const validateVideoMetadata = (metadata) => {
    const required = ['videoId', 'title', 'channelTitle', 'thumbnail', 'url'];
    const missing = required.filter(field => !metadata[field]);
    
    if (missing.length > 0) {
        return {
            valid: false,
            error: `Missing required fields: ${missing.join(', ')}`
        };
    }

    // Validate video ID format
    if (!/^[a-zA-Z0-9_-]{11}$/.test(metadata.videoId)) {
        return {
            valid: false,
            error: 'Invalid video ID format'
        };
    }

    // Validate URL
    const urlValidation = validateVideoURL(metadata.url);
    if (!urlValidation.valid) {
        return urlValidation;
    }

    // Validate thumbnail URL
    if (!metadata.thumbnail.startsWith('http')) {
        return {
            valid: false,
            error: 'Invalid thumbnail URL format'
        };
    }

    return { valid: true };
};

/**
 * Extract video information from YouTube URL
 */
const extractVideoInfo = (url) => {
    const videoId = parseYouTubeURL(url);
    if (!videoId) {
        return null;
    }

    const urls = generateYouTubeURLs(videoId);
    if (!urls) {
        return null;
    }

    return {
        videoId,
        watchUrl: urls.watch,
        embedUrl: urls.embed,
        shortUrl: urls.short,
        shareUrl: urls.share,
        isValid: true
    };
};

/**
 * Check if video is live or upcoming
 */
const isLiveVideo = (videoDetails) => {
    return videoDetails?.snippet?.liveBroadcastContent && 
           videoDetails.snippet.liveBroadcastContent !== 'none';
};

/**
 * Check if video is age-restricted
 */
const isAgeRestricted = (videoDetails) => {
    return videoDetails?.contentDetails?.contentRating?.ytRating === 'ytAgeRestricted';
};

/**
 * Extract video duration in seconds
 */
const parseDuration = (durationString) => {
    if (!durationString || typeof durationString !== 'string') {
        return null;
    }

    // YouTube duration format: PT4M13S
    const match = durationString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) {
        return null;
    }

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Format duration for display (seconds to MM:SS or HH:MM:SS)
 */
const formatDuration = (seconds) => {
    if (!seconds || typeof seconds !== 'number') {
        return null;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Categorize video based on title and description
 */
const categorizeVideo = (title, description, channelTitle) => {
    const text = `${title} ${description} ${channelTitle}`.toLowerCase();
    
    const categories = {
        pharmacy: [
            'pharmacy', 'pharmaceutical', 'drug', 'medication', 'prescription',
            'dosage', 'pharmacology', 'clinical pharmacy', 'hospital pharmacy'
        ],
        medicine: [
            'medicine', 'medical', 'doctor', 'physician', 'clinical', 'patient',
            'diagnosis', 'treatment', 'surgery', 'anatomy', 'physiology'
        ],
        nursing: [
            'nursing', 'nurse', 'patient care', 'healthcare', 'hospital',
            'medical assistant', 'care', 'patient', 'vital signs'
        ],
        science: [
            'science', 'biology', 'chemistry', 'physics', 'laboratory',
            'research', 'experiment', 'scientific', 'cell', 'molecule'
        ],
        mathematics: [
            'math', 'mathematics', 'algebra', 'calculus', 'geometry',
            'statistics', 'equation', 'formula', 'number', 'calculation'
        ],
        engineering: [
            'engineering', 'technical', 'mechanical', 'electrical', 'civil',
            'computer', 'software', 'hardware', 'system', 'design'
        ]
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return category;
        }
    }

    return 'other';
};

/**
 * Determine video difficulty level based on content analysis
 */
const determineDifficulty = (title, description, channelTitle, duration) => {
    const text = `${title} ${description} ${channelTitle}`.toLowerCase();
    
    // Beginner indicators
    const beginnerKeywords = [
        'introduction', 'basics', 'beginner', 'getting started', 'tutorial',
        'overview', 'fundamentals', 'first steps', 'basic', 'simple'
    ];
    
    // Advanced indicators
    const advancedKeywords = [
        'advanced', 'complex', 'intermediate', 'advanced topics',
        'complex analysis', 'advanced techniques', 'in-depth', 'detailed'
    ];
    
    // Expert indicators
    const expertKeywords = [
        'expert', 'professional', 'research', 'graduate', 'university',
        'advanced research', 'cutting edge', 'state of the art'
    ];

    // Check duration for context
    const durationSeconds = parseDuration(duration);
    const isShort = durationSeconds && durationSeconds < 600; // < 10 minutes
    const isLong = durationSeconds && durationSeconds > 3600; // > 1 hour

    // Determine difficulty
    if (expertKeywords.some(keyword => text.includes(keyword)) || isLong) {
        return 'advanced';
    }
    
    if (advancedKeywords.some(keyword => text.includes(keyword))) {
        return 'intermediate';
    }
    
    if (beginnerKeywords.some(keyword => text.includes(keyword)) || isShort) {
        return 'beginner';
    }
    
    return 'intermediate'; // Default to intermediate
};

/**
 * Generate shareable video information
 */
const generateShareInfo = (videoData, userId = null) => {
    const videoId = parseYouTubeURL(videoData.url);
    if (!videoId) {
        return null;
    }

    const urls = generateYouTubeURLs(videoId);
    
    return {
        title: videoData.title,
        description: videoData.description,
        thumbnail: videoData.thumbnail,
        channel: videoData.channelTitle,
        duration: videoData.duration,
        viewCount: videoData.viewCount,
        urls,
        pinnedBy: userId,
        pinnedAt: new Date().toISOString(),
        shareable: true
    };
};

/**
 * Rate limiting configuration for video operations
 */
const rateLimits = {
    search: { requests: 100, window: 60 }, // 100 requests per minute
    pin: { requests: 20, window: 60 }, // 20 pin operations per minute
    favorite: { requests: 50, window: 60 }, // 50 favorite operations per minute
    bulk: { requests: 5, window: 300 } // 5 bulk operations per 5 minutes
};

/**
 * Clean and sanitize video data
 */
const sanitizeVideoData = (videoData) => {
    return {
        videoId: videoData.videoId?.trim(),
        title: videoData.title?.trim().substring(0, 500),
        description: videoData.description?.trim().substring(0, 2000),
        channelTitle: videoData.channelTitle?.trim().substring(0, 100),
        publishedAt: videoData.publishedAt,
        thumbnail: videoData.thumbnail?.trim(),
        url: videoData.url?.trim(),
        category: categorizeVideo(videoData.title, videoData.description, videoData.channelTitle),
        difficulty: determineDifficulty(videoData.title, videoData.description, videoData.channelTitle, videoData.duration),
        tags: (videoData.tags || []).slice(0, 10),
        duration: videoData.duration,
        viewCount: videoData.viewCount,
        likeCount: videoData.likeCount
    };
};

export { 
    validateVideoURL,
    parseYouTubeURL,
    generateYouTubeURLs,
    validateVideoMetadata,
    extractVideoInfo,
    isLiveVideo,
    isAgeRestricted,
    parseDuration,
    formatDuration,
    categorizeVideo,
    determineDifficulty,
    generateShareInfo,
    rateLimits,
    sanitizeVideoData
 };