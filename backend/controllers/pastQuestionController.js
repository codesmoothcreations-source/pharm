import PastQuestion from '../models/PastQuestion.js';
import Course from '../models/Course.js';
import { cloudinary } from '../config/cloudinary.js';
import path from 'path';

// Helper function to delete file from Cloudinary
const deleteFileFromCloudinary = async (cloudinaryPublicId) => {
    try {
        if (cloudinaryPublicId) {
            console.log('Deleting file from Cloudinary:', cloudinaryPublicId);
            
            const result = await cloudinary.uploader.destroy(cloudinaryPublicId);
            console.log('Cloudinary deletion result:', result);
            
            return result;
        }
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        // Don't throw error - file deletion failure shouldn't block database deletion
    }
};

// Helper function to handle course creation/lookup
const handleCourseReference = async (courseData) => {
    if (!courseData) {
        return null;
    }

    try {
        // Check if it's already a valid MongoDB ObjectId (24 character hex string)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(courseData);
        
        if (isObjectId) {
            // It's an ObjectId, try to find the course by ID first
            const course = await Course.findById(courseData);
            if (course) {
                console.log('Found course by ObjectId:', course.courseCode);
                return course._id;
            }
        }
        
        // If not an ObjectId or ObjectId not found, treat as course code
        if (typeof courseData === 'string') {
            let course = await Course.findOne({ courseCode: courseData.toUpperCase() });
            if (!course) {
                course = await Course.create({
                    courseCode: courseData.toUpperCase(),
                    courseName: courseData,
                    level: '100', // Default level
                    semester: '1'  // Default semester
                });
                console.log('Auto-created course:', course.courseCode);
            }
            return course._id;
        }
        
        return null;
    } catch (error) {
        console.error('Error handling course reference:', error);
        return null;
    }
};

/**
 * @desc    Get all past questions with filtering and pagination
 * @route   GET /api/past-questions
 * @access  Public
 */
const getPastQuestions = async (req, res) => {
    try {
        // Build query object for filtering
        let query = { isApproved: true };
        
        // Filter by level
        if (req.query.level) {
            query.level = req.query.level;
        }
        
        // Filter by semester
        if (req.query.semester) {
            query.semester = req.query.semester;
        }
        
        // Filter by course - need to lookup course by code first
        // Support both 'course' and 'courseCode' parameters for flexibility
        const courseQuery = req.query.course || req.query.courseCode;
        if (courseQuery) {
            try {
                console.log('Filtering by course:', courseQuery);
                // First find the course by code
                const course = await Course.findOne({ courseCode: courseQuery.toUpperCase() });
                if (course) {
                    query.course = course._id;
                    console.log('Found course:', course.courseCode, 'ID:', course._id);
                } else {
                    console.log('Course not found:', courseQuery);
                    // If course not found, return empty results
                    return res.json({
                        success: true,
                        count: 0,
                        pagination: { page: 1, pages: 0, total: 0 },
                        data: []
                    });
                }
            } catch (error) {
                console.error('Error looking up course:', error);
                return res.json({
                    success: true,
                    count: 0,
                    pagination: { page: 1, pages: 0, total: 0 },
                    data: []
                });
            }
        }
        
        // Search in title and tags
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        console.log('Query:', query);

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Execute query with population and pagination
        const pastQuestions = await PastQuestion.find(query)
            .populate('course', 'courseCode courseName level semester')
            .populate('uploader', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await PastQuestion.countDocuments(query);

        console.log('Found questions:', pastQuestions.length);

        res.json({
            success: true,
            count: pastQuestions.length,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total
            },
            data: pastQuestions
        });
    } catch (error) {
        console.error('Get past questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Get single past question
 * @route   GET /api/past-questions/:id
 * @access  Public
 */
const getPastQuestion = async (req, res) => {
    try {
        const pastQuestion = await PastQuestion.findById(req.params.id)
            .populate('course', 'courseCode courseName level semester')
            .populate('uploader', 'name email');

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        // Increment view count
        pastQuestion.viewCount += 1;
        await pastQuestion.save();

        res.json({
            success: true,
            data: pastQuestion
        });
    } catch (error) {
        console.error('Get past question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Create new past question
 * @route   POST /api/past-questions
 * @access  Private
 */
const createPastQuestion = async (req, res) => {
    try {
        console.log('Creating past question with data:', req.body);
        console.log('File:', req.file);
        console.log('User:', req.user);

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        // Validate required fields
        const requiredFields = ['title', 'course', 'academicYear', 'semester', 'level'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Add uploader to request body
        req.body.uploader = req.user.id;

        // Add file information from Cloudinary
        console.log('Cloudinary result check:', {
            hasCloudinaryResult: !!req.file.cloudinaryResult,
            filePath: req.file.path,
            fileCloudinaryResult: req.file.cloudinaryResult
        });
        
        if (req.file.cloudinaryResult) {
            console.log('Using Cloudinary URL:', req.file.cloudinaryResult.secure_url);
            req.body.fileUrl = req.file.cloudinaryResult.secure_url;
            req.body.fileType = req.file.mimetype.startsWith('image/') ? 'image' :
                               req.file.mimetype === 'application/pdf' ? 'pdf' : 'doc';
            req.body.fileSize = req.file.cloudinaryResult.bytes;
            req.body.cloudinaryPublicId = req.file.cloudinaryResult.public_id;
        } else {
            console.log('WARNING: No Cloudinary result, falling back to local path:', req.file.path);
            // Fallback to original file info if Cloudinary upload didn't complete
            req.body.fileUrl = req.file.path;
            req.body.fileType = req.file.mimetype.startsWith('image/') ? 'image' :
                               req.file.mimetype === 'application/pdf' ? 'pdf' : 'doc';
            req.body.fileSize = req.file.size;
        }

        // Auto-approve if user is admin
        if (req.user.role === 'admin') {
            req.body.isApproved = true;
        }

        // Handle course reference - convert string to ObjectId
        if (req.body.course && typeof req.body.course === 'string') {
            const courseId = await handleCourseReference(req.body.course);
            if (courseId) {
                req.body.course = courseId;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid course reference'
                });
            }
        }

        // Process tags if they're a comma-separated string
        if (req.body.tags && typeof req.body.tags === 'string') {
            req.body.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        console.log('Final request body:', req.body);

        const pastQuestion = await PastQuestion.create(req.body);
        console.log('Created past question:', pastQuestion);

        // Populate the created past question
        const populatedPastQuestion = await PastQuestion.findById(pastQuestion._id)
            .populate('course', 'courseCode courseName')
            .populate('uploader', 'name');

        res.status(201).json({
            success: true,
            data: populatedPastQuestion,
            message: 'Past question uploaded successfully' +
                    (req.user.role !== 'admin' ? ' - Waiting for admin approval' : '')
        });
    } catch (error) {
        console.error('Create past question error:', error);
        console.error('Error details:', error.errors);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error creating past question',
            error: error.message
        });
    }
};

/**
 * @desc    Update question metadata only (no file required)
 * @route   PUT /api/past-questions/:id/metadata
 * @access  Private (Admin or Owner)
 */
const updateQuestionMetadata = async (req, res) => {
    try {
        console.log('Updating question metadata:', req.params.id);
        console.log('Metadata update data:', req.body);

        let pastQuestion = await PastQuestion.findById(req.params.id);

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        // Check if user is owner or admin
        if (pastQuestion.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this past question'
            });
        }

        // Handle course field if it's a string or needs conversion
        if (req.body.course) {
            if (typeof req.body.course === 'string' && !req.body.course.match(/^[0-9a-fA-F]{24}$/)) {
                // It's a course code, not an ObjectId
                const courseId = await handleCourseReference(req.body.course);
                if (courseId) {
                    req.body.course = courseId;
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid course reference'
                    });
                }
            }
        }

        // Process tags if they're a comma-separated string
        if (req.body.tags && typeof req.body.tags === 'string') {
            req.body.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        console.log('Final metadata update body:', req.body);

        pastQuestion = await PastQuestion.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('course', 'courseCode courseName')
         .populate('uploader', 'name');

        console.log('Updated past question metadata:', pastQuestion);

        res.json({
            success: true,
            data: pastQuestion,
            message: 'Past question updated successfully'
        });
    } catch (error) {
        console.error('Update question metadata error:', error);
        console.error('Error details:', error.errors);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error updating past question',
            error: error.message
        });
    }
};

/**
 * @desc    Update past question
 * @route   PUT /api/past-questions/:id
 * @access  Private (Admin or Owner)
 */
const updatePastQuestion = async (req, res) => {
    try {
        console.log('Updating past question:', req.params.id);
        console.log('Update data:', req.body);
        console.log('File:', req.file);

        let pastQuestion = await PastQuestion.findById(req.params.id);

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        // Check if user is owner or admin
        if (pastQuestion.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this past question'
            });
        }

        // Handle course field if it's a string or needs conversion
        if (req.body.course) {
            if (typeof req.body.course === 'string' && !req.body.course.match(/^[0-9a-fA-F]{24}$/)) {
                // It's a course code, not an ObjectId
                const courseId = await handleCourseReference(req.body.course);
                if (courseId) {
                    req.body.course = courseId;
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid course reference'
                    });
                }
            }
        }

        // Only update file information if a new file was uploaded
        if (req.file) {
            if (req.file.cloudinaryResult) {
                req.body.fileUrl = req.file.cloudinaryResult.secure_url;
                req.body.fileType = req.file.mimetype.startsWith('image/') ? 'image' :
                                   req.file.mimetype === 'application/pdf' ? 'pdf' : 'doc';
                req.body.fileSize = req.file.cloudinaryResult.bytes;
                req.body.cloudinaryPublicId = req.file.cloudinaryResult.public_id;
            } else {
                req.body.fileUrl = req.file.path;
                req.body.fileType = req.file.mimetype.startsWith('image/') ? 'image' :
                                   req.file.mimetype === 'application/pdf' ? 'pdf' : 'doc';
                req.body.fileSize = req.file.size;
            }
        }

        // Process tags if they're a comma-separated string
        if (req.body.tags && typeof req.body.tags === 'string') {
            req.body.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        console.log('Final update body:', req.body);

        pastQuestion = await PastQuestion.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('course', 'courseCode courseName')
         .populate('uploader', 'name');

        console.log('Updated past question:', pastQuestion);

        res.json({
            success: true,
            data: pastQuestion,
            message: 'Past question updated successfully'
        });
    } catch (error) {
        console.error('Update past question error:', error);
        console.error('Error details:', error.errors);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error updating past question',
            error: error.message
        });
    }
};

/**
 * @desc    Delete past question
 * @route   DELETE /api/past-questions/:id
 * @access  Private (Admin or Owner)
 */
const deletePastQuestion = async (req, res) => {
    try {
        const pastQuestion = await PastQuestion.findById(req.params.id);

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        // Check if user is owner or admin
        if (pastQuestion.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this past question'
            });
        }

        // Delete file from Cloudinary if it exists
        await deleteFileFromCloudinary(pastQuestion.cloudinaryPublicId);

        // Delete the database record
        await PastQuestion.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            data: {},
            message: 'Past question deleted successfully'
        });
    } catch (error) {
        console.error('Delete past question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting past question',
            error: error.message
        });
    }
};

/**
 * @desc    Approve past question (Admin only)
 * @route   PUT /api/past-questions/:id/approve
 * @access  Private (Admin)
 */
const approvePastQuestion = async (req, res) => {
    try {
        const pastQuestion = await PastQuestion.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        ).populate('course', 'courseCode courseName')
         .populate('uploader', 'name email');

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        res.json({
            success: true,
            data: pastQuestion,
            message: 'Past question approved successfully'
        });
    } catch (error) {
        console.error('Approve past question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error approving past question',
            error: error.message
        });
    }
};

/**
 * @desc    Download past question (tracks download count)
 * @route   GET /api/past-questions/:id/download
 * @access  Public
 */
const downloadPastQuestion = async (req, res) => {
    try {
        const pastQuestion = await PastQuestion.findById(req.params.id);

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        // Increment download count
        pastQuestion.downloadCount += 1;
        await pastQuestion.save();

        // Check if it's a Cloudinary URL or local file
        if (pastQuestion.fileUrl && pastQuestion.fileUrl.includes('cloudinary.com')) {
            // For Cloudinary files, redirect to the URL (which will trigger download for most files)
            const fileExtension = pastQuestion.fileType === 'pdf' ? 'pdf' : 
                                 pastQuestion.fileType === 'image' ? 'png' : 'doc';
            const filename = `${pastQuestion.title}.${fileExtension}`;
            
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.redirect(pastQuestion.fileUrl);
        } else {
            // Fallback for local files
            const filePath = path.join(__dirname, '..', pastQuestion.fileUrl);
            const fileExtension = pastQuestion.fileType === 'pdf' ? 'pdf' : 
                                 pastQuestion.fileType === 'image' ? 'png' : 'doc';
            const filename = `${pastQuestion.title}.${fileExtension}`;
            
            res.download(filePath, filename);
        }

    } catch (error) {
        console.error('Download past question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error downloading past question',
            error: error.message
        });
    }
};

/**
 * @desc    Get filter options for dropdowns
 * @route   GET /api/past-questions/filters
 * @access  Public
 */
const getFilterOptions = async (req, res) => {
    try {
        // Get unique levels
        const levels = await PastQuestion.distinct('level', { isApproved: true });
        levels.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        // Get unique semesters
        const semesters = await PastQuestion.distinct('semester', { isApproved: true });
        semesters.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        // Get unique departments
        const departments = await PastQuestion.distinct('department', { isApproved: true });
        departments.sort();

        // Get unique academic years and format as yyyy/yyyy
        const academicYears = await PastQuestion.distinct('academicYear', { isApproved: true });
        const formattedYears = academicYears
            .filter(year => year && typeof year === 'string')
            .map(year => {
                // Convert formats like "2024" or "2023-2024" to "2023/2024"
                if (year.includes('-')) {
                    return year.replace('-', '/');
                } else if (year.match(/^\d{4}$/)) {
                    // Single year - assume next academic year
                    const nextYear = parseInt(year) + 1;
                    return `${year}/${nextYear}`;
                }
                return year;
            })
            .sort();

        // Get all courses for scrolling dropdown
        const courses = await Course.find({ isActive: true })
            .select('courseCode courseName level semester')
            .sort({ level: 1, semester: 1, courseCode: 1 });

        const formattedCourses = courses.map(course => ({
            value: course.courseCode,
            label: `${course.courseCode} - ${course.courseName}`,
            level: course.level,
            semester: course.semester,
            display: `${course.courseCode} (${course.level}.${course.semester})`
        }));

        res.json({
            success: true,
            data: {
                levels,
                semesters,
                departments,
                academicYears: formattedYears,
                courses: formattedCourses
            }
        });
    } catch (error) {
        console.error('Get filter options error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching filter options',
            error: error.message
        });
    }
};

export { 
    getPastQuestions,
    getPastQuestion,
    createPastQuestion,
    updatePastQuestion,
    updateQuestionMetadata,
    deletePastQuestion,
    approvePastQuestion,
    downloadPastQuestion,
    getFilterOptions
 };