import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema for authentication and authorization
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Don't return password in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    department: {
        type: String,
        default: 'Pharmacy' // Default department as per requirements
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt
});

/**
 * Encrypt password before saving
 */
userSchema.pre('save', async function(next) {
    // Only run if password was modified
    if (!this.isModified('password')) {
        next();
    }

    // Hash password with salt rounds
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Check if entered password matches hashed password in database
 * @param {string} enteredPassword - Password to compare
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);