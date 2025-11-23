import mongoose from 'mongoose';

const pinnedVideoSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    channelTitle: {
        type: String,
        required: true,
        trim: true
    },
    publishedAt: {
        type: Date,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    duration: {
        type: String
    },
    viewCount: {
        type: String
    },
    likeCount: {
        type: String
    },
    tags: [{
        type: String
    }],
    category: {
        type: String,
        enum: ['pharmacy', 'medicine', 'nursing', 'science', 'mathematics', 'engineering', 'other'],
        default: 'other'
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    pinnedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    favoriteCount: {
        type: Number,
        default: 0
    },
    pinDate: {
        type: Date,
        default: Date.now
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    accessCount: {
        type: Number,
        default: 0
    },
    relatedQuestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PastQuestion'
    }],
    status: {
        type: String,
        enum: ['active', 'expired', 'removed'],
        default: 'active'
    },
    metadata: {
        duration: String,
        definition: String,
        caption: String,
        licensedContent: Boolean,
        projection: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance optimization
pinnedVideoSchema.index({ videoId: 1 });
pinnedVideoSchema.index({ pinnedBy: 1 });
pinnedVideoSchema.index({ isPublic: 1 });
pinnedVideoSchema.index({ category: 1 });
pinnedVideoSchema.index({ createdAt: -1 });
pinnedVideoSchema.index({ accessCount: -1 });
pinnedVideoSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for video duration in seconds
pinnedVideoSchema.virtual('durationSeconds').get(function() {
    // Parse YouTube duration format (PT4M13S -> 253)
    if (!this.duration) return null;
    const match = this.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return null;
    
    const hours = parseInt(match[1]?.replace('H', '') || 0);
    const minutes = parseInt(match[2]?.replace('M', '') || 0);
    const seconds = parseInt(match[3]?.replace('S', '') || 0);
    
    return hours * 3600 + minutes * 60 + seconds;
});

// Pre-save middleware to update lastAccessed
pinnedVideoSchema.pre('save', function(next) {
    this.lastAccessed = new Date();
    this.accessCount += 1;
    next();
});

// Static methods
pinnedVideoSchema.statics.getPopularVideos = function(limit = 10) {
    return this.find({ isPublic: true, status: 'active' })
               .sort({ accessCount: -1, favoriteCount: -1 })
               .limit(limit)
               .populate('pinnedBy', 'name email')
               .populate('relatedQuestions', 'title course');
};

pinnedVideoSchema.statics.getUserPinnedVideos = function(userId, includePublic = false) {
    const query = { pinnedBy: userId };
    if (!includePublic) {
        query.isPublic = false;
    }
    return this.find(query).sort({ pinDate: -1 });
};

pinnedVideoSchema.statics.getRecentPins = function(limit = 20) {
    return this.find({ isPublic: true, status: 'active' })
               .sort({ pinDate: -1 })
               .limit(limit)
               .populate('pinnedBy', 'name email')
               .populate('relatedQuestions', 'title course');
};

// Instance methods
pinnedVideoSchema.methods.incrementAccess = function() {
    this.accessCount += 1;
    this.lastAccessed = new Date();
    return this.save();
};

pinnedVideoSchema.methods.toggleVisibility = function() {
    this.isPublic = !this.isPublic;
    return this.save();
};

pinnedVideoSchema.methods.addFavorite = function() {
    this.favoriteCount += 1;
    return this.save();
};

pinnedVideoSchema.methods.removeFavorite = function() {
    if (this.favoriteCount > 0) {
        this.favoriteCount -= 1;
        return this.save();
    }
    return Promise.resolve(this);
};

export default mongoose.model('PinnedVideo', pinnedVideoSchema);