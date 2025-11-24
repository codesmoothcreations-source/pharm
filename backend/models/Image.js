import mongoose from 'mongoose';

/**
 * Image Schema
 * Stores image metadata and Cloudinary information
 */
const imageSchema = new mongoose.Schema({
    // Basic image information
    title: {
        type: String,
        required: [true, 'Image title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Cloudinary storage information
    cloudinaryId: {
        type: String,
        required: true,
        unique: true
    },
    
    imageUrl: {
        type: String,
        required: true
    },
    
    secureUrl: {
        type: String,
        required: true
    },
    
    publicId: {
        type: String,
        required: true,
        unique: true
    },
    
    format: {
        type: String,
        required: true
    },
    
    width: {
        type: Number,
        required: true
    },
    
    height: {
        type: Number,
        required: true
    },
    
    size: {
        type: Number,
        required: true // Size in bytes
    },
    
    // User and permissions
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    isPublic: {
        type: Boolean,
        default: true
    },
    
    // Metadata
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    
    // Analytics and tracking
    views: {
        type: Number,
        default: 0
    },
    
    downloads: {
        type: Number,
        default: 0
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/**
 * Virtual for formatted file size
 */
imageSchema.virtual('formattedSize').get(function() {
    const bytes = this.size;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

/**
 * Virtual for image aspect ratio
 */
imageSchema.virtual('aspectRatio').get(function() {
    if (this.width && this.height) {
        return (this.width / this.height).toFixed(2);
    }
    return null;
});

/**
 * Indexes for better query performance
 */
imageSchema.index({ uploadedBy: 1, createdAt: -1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ isPublic: 1 });
imageSchema.index({ title: 'text', description: 'text' });

/**
 * Pre-save middleware to update the updatedAt field
 */
imageSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

/**
 * Static method to get user's image statistics
 */
imageSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { uploadedBy: userId } },
        {
            $group: {
                _id: null,
                totalImages: { $sum: 1 },
                totalSize: { $sum: '$size' },
                publicImages: {
                    $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
                },
                privateImages: {
                    $sum: { $cond: [{ $eq: ['$isPublic', false] }, 1, 0] }
                }
            }
        }
    ]);
    
    return stats.length > 0 ? stats[0] : {
        totalImages: 0,
        totalSize: 0,
        publicImages: 0,
        privateImages: 0
    };
};

/**
 * Instance method to increment view count
 */
imageSchema.methods.incrementViews = async function() {
    this.views += 1;
    return this.save();
};

/**
 * Instance method to increment download count
 */
imageSchema.methods.incrementDownloads = async function() {
    this.downloads += 1;
    return this.save();
};

export default mongoose.model('Image', imageSchema);