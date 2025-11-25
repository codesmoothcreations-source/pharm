import Course from '../models/Course.js';
import PastQuestion from '../models/PastQuestion.js';

/**
 * @desc    Get all courses with question counts
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = async (req, res) => {
    try {
        // Get all courses
        const courses = await Course.find({ isActive: true }).sort({ level: 1, semester: 1, courseCode: 1 });

        // For each course, get the count of past questions
        const coursesWithStats = await Promise.all(
            courses.map(async (course) => {
                const questionCount = await PastQuestion.countDocuments({ 
                    course: course._id,
                    isApproved: true 
                });

                const downloadCount = await PastQuestion.aggregate([
                    { $match: { course: course._id, isApproved: true } },
                    { $group: { _id: null, total: { $sum: '$downloadCount' } } }
                ]);

                return {
                    _id: course._id,
                    courseCode: course.courseCode,
                    courseName: course.courseName,
                    level: course.level,
                    semester: course.semester,
                    description: course.description,
                    credits: course.credits,
                    questionCount,
                    downloadCount: downloadCount.length > 0 ? downloadCount[0].total : 0,
                    createdAt: course.createdAt,
                    updatedAt: course.updatedAt
                };
            })
        );

        // Calculate pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = coursesWithStats.length;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        // Apply pagination
        const paginatedCourses = coursesWithStats.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            count: paginatedCourses.length,
            total,
            pagination,
            data: paginatedCourses
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching courses',
            error: error.message
        });
    }
};

/**
 * @desc    Get single course with questions
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getSingleCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Get questions for this course
        const questions = await PastQuestion.find({ 
            course: course._id,
            isApproved: true 
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                course,
                questions,
                questionCount: questions.length,
                totalDownloads: questions.reduce((sum, q) => sum + (q.downloadCount || 0), 0)
            }
        });
    } catch (error) {
        console.error('Get single course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching course',
            error: error.message
        });
    }
};

/**
 * @desc    Create new course (Admin only)
 * @route   POST /api/courses
 * @access  Private (Admin)
 */
const createCourse = async (req, res) => {
    try {
        const { courseCode, courseName, level, semester, description, credits } = req.body;

        // Check if course already exists
        const existingCourse = await Course.findOne({ courseCode });
        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'Course with this code already exists'
            });
        }

        const course = await Course.create({
            courseCode,
            courseName,
            level,
            semester,
            description,
            credits
        });

        res.status(201).json({
            success: true,
            data: course,
            message: 'Course created successfully'
        });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating course',
            error: error.message
        });
    }
};

/**
 * @desc    Update course (Admin only)
 * @route   PUT /api/courses/:id
 * @access  Private (Admin)
 */
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course,
            message: 'Course updated successfully'
        });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating course',
            error: error.message
        });
    }
};

/**
 * @desc    Delete course (Admin only)
 * @route   DELETE /api/courses/:id
 * @access  Private (Admin)
 */
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if course has questions
        const questionCount = await PastQuestion.countDocuments({ course: course._id });
        if (questionCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete course with existing questions'
            });
        }

        await Course.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting course',
            error: error.message
        });
    }
};

export { 
    getAllCourses,
    getSingleCourse,
    createCourse,
    updateCourse,
    deleteCourse
 };