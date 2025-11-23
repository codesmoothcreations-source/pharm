import mongoose from 'mongoose';

/**
 * Causes Schema for categorizing question causes/topics
 */
const causeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Cause name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Cause name cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        maxlength: [50, 'Category cannot be more than 50 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    color: {
        type: String,
        default: '#1fa750',
        validate: {
            validator: function(v) {
                return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
            },
            message: 'Color must be a valid hex color code'
        }
    },
    icon: {
        type: String,
        trim: true,
        default: '📋'
    }
}, {
    timestamps: true
});

// Index for efficient querying
causeSchema.index({ category: 1, isActive: 1 });
causeSchema.index({ name: 1 });

/**
 * Static method to get active causes
 */
causeSchema.statics.getActive = function() {
    return this.find({ isActive: true })
        .sort({ category: 1, name: 1 });
};

/**
 * Static method to get causes by category
 */
causeSchema.statics.getByCategory = function(category) {
    return this.find({ category: category, isActive: true })
        .sort({ name: 1 });
};

export default mongoose.model('Cause', causeSchema);