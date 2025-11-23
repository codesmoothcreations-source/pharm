import mongoose from 'mongoose';

/**
 * Course Schema to organize past questions by course
 */
const courseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: [true, 'Please add a course code'],
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: [10, 'Course code cannot be more than 10 characters']
    },
    courseName: {
        type: String,
        required: [true, 'Please add a course name'],
        trim: true,
        maxlength: [100, 'Course name cannot be more than 100 characters']
    },
    level: {
        type: String,
        required: [true, 'Please specify academic level'],
        enum: ['100', '200', '300', '400', '500']
    },
    semester: {
        type: String,
        required: [true, 'Please specify semester'],
        enum: ['1', '2']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    credits: {
        type: Number,
        default: 3
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for efficient queries by level and semester
courseSchema.index({ level: 1, semester: 1 });

export default mongoose.model('Course', courseSchema);