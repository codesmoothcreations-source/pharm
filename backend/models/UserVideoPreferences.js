import mongoose from 'mongoose';

const userVideoPreferencesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    favorites: [{
        videoId: {
            type: String,
            required: true
        },
        title: String,
        pinnedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PinnedVideo'
        },
        favoritedAt: {
            type: Date,
            default: Date.now
        }
    }],
    recentSearches: [{
        query: {
            type: String,
            required: true
        },
        filters: {
            category: String,
            difficulty: String,
            duration: String,
            sortBy: String
        },
        searchedAt: {
            type: Date,
            default: Date.now
        }
    }],
    searchHistory: [{
        searchTerm: {
            type: String,
            required: true
        },
        searchType: {
            type: String,
            enum: ['youtube', 'pinned', 'favorites', 'recent'],
            default: 'youtube'
        },
        resultsCount: {
            type: Number,
            default: 0
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    preferredCategories: [{
        type: String,
        enum: ['pharmacy', 'medicine', 'nursing', 'science', 'mathematics', 'engineering', 'other']
    }],
    preferredDifficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'all'],
        default: 'all'
    },
    defaultSearchFilters: {
        sortBy: {
            type: String,
            enum: ['relevance', 'date', 'popularity', 'duration'],
            default: 'relevance'
        },
        duration: {
            type: String,
            enum: ['any', 'short', 'medium', 'long'],
            default: 'any'
        },
        dateRange: {
            type: String,
            enum: ['any', 'week', 'month', 'year'],
            default: 'any'
        },
        category: {
            type: String,
            enum: ['all', 'pharmacy', 'medicine', 'nursing', 'science', 'mathematics', 'engineering'],
            default: 'all'
        }
    },
    videoSettings: {
        autoPlay: {
            type: Boolean,
            default: false
        },
        showDescriptions: {
            type: Boolean,
            default: true
        },
        showThumbnails: {
            type: Boolean,
            default: true
        },
        itemsPerPage: {
            type: Number,
            default: 12,
            min: 6,
            max: 50
        }
    },
    analytics: {
        totalSearches: {
            type: Number,
            default: 0
        },
        totalPinned: {
            type: Number,
            default: 0
        },
        totalFavorites: {
            type: Number,
            default: 0
        },
        lastSearchDate: Date,
        lastPinDate: Date,
        lastFavoriteDate: Date
    }
}, {
    timestamps: true
});

// Indexes for performance
userVideoPreferencesSchema.index({ user: 1 });
userVideoPreferencesSchema.index({ 'favorites.videoId': 1 });
userVideoPreferencesSchema.index({ 'recentSearches.searchedAt': -1 });
userVideoPreferencesSchema.index({ 'analytics.lastSearchDate': -1 });

// Instance methods
userVideoPreferencesSchema.methods.addRecentSearch = function(searchData) {
    // Remove if already exists and add to beginning
    this.recentSearches = this.recentSearches.filter(
        search => search.query !== searchData.query
    );
    
    this.recentSearches.unshift({
        query: searchData.query,
        filters: searchData.filters || {},
        searchedAt: new Date()
    });
    
    // Keep only last 20 searches
    if (this.recentSearches.length > 20) {
        this.recentSearches = this.recentSearches.slice(0, 20);
    }
    
    this.analytics.totalSearches += 1;
    this.analytics.lastSearchDate = new Date();
    
    return this.save();
};

userVideoPreferencesSchema.methods.addToFavorites = function(videoData) {
    // Remove if already exists
    this.favorites = this.favorites.filter(
        fav => fav.videoId !== videoData.videoId
    );
    
    this.favorites.unshift({
        videoId: videoData.videoId,
        title: videoData.title,
        pinnedBy: videoData.pinnedBy,
        favoritedAt: new Date()
    });
    
    this.analytics.totalFavorites += 1;
    this.analytics.lastFavoriteDate = new Date();
    
    return this.save();
};

userVideoPreferencesSchema.methods.removeFromFavorites = function(videoId) {
    this.favorites = this.favorites.filter(fav => fav.videoId !== videoId);
    
    if (this.analytics.totalFavorites > 0) {
        this.analytics.totalFavorites -= 1;
    }
    
    return this.save();
};

userVideoPreferencesSchema.methods.addSearchHistory = function(searchData) {
    this.searchHistory.unshift({
        searchTerm: searchData.searchTerm,
        searchType: searchData.searchType || 'youtube',
        resultsCount: searchData.resultsCount || 0,
        timestamp: new Date()
    });
    
    // Keep only last 50 searches
    if (this.searchHistory.length > 50) {
        this.searchHistory = this.searchHistory.slice(0, 50);
    }
    
    return this.save();
};

userVideoPreferencesSchema.methods.getQuickAccessSearches = function(limit = 10) {
    return this.recentSearches
        .sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt))
        .slice(0, limit);
};

// Static methods
userVideoPreferencesSchema.statics.getUserPreferences = function(userId) {
    return this.findOne({ user: userId });
};

userVideoPreferencesSchema.statics.createDefaultPreferences = function(userId) {
    return this.create({
        user: userId,
        preferredCategories: ['pharmacy', 'medicine'],
        defaultSearchFilters: {
            sortBy: 'relevance',
            duration: 'any',
            dateRange: 'any',
            category: 'all'
        },
        videoSettings: {
            autoPlay: false,
            showDescriptions: true,
            showThumbnails: true,
            itemsPerPage: 12
        }
    });
};

export default mongoose.model('UserVideoPreferences', userVideoPreferencesSchema);