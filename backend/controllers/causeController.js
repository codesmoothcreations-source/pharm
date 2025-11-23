import Cause from '../models/Cause.js';

/**
 * @desc    Get all causes
 * @route   GET /api/causes
 * @access  Public
 */
const getAllCauses = async (req, res) => {
    try {
        const causes = await Cause.find({ isActive: true }).sort({ category: 1, name: 1 });

        res.status(200).json({
            success: true,
            count: causes.length,
            data: causes
        });
    } catch (error) {
        console.error('Get causes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching causes',
            error: error.message
        });
    }
};

/**
 * @desc    Get causes by category
 * @route   GET /api/causes/category/:category
 * @access  Public
 */
const getCausesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        const causes = await Cause.find({ 
            category: category.toLowerCase(), 
            isActive: true 
        }).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: causes.length,
            category: category,
            data: causes
        });
    } catch (error) {
        console.error('Get causes by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching causes by category',
            error: error.message
        });
    }
};

/**
 * @desc    Get single cause
 * @route   GET /api/causes/:id
 * @access  Public
 */
const getSingleCause = async (req, res) => {
    try {
        const cause = await Cause.findById(req.params.id);

        if (!cause) {
            return res.status(404).json({
                success: false,
                message: 'Cause not found'
            });
        }

        res.status(200).json({
            success: true,
            data: cause
        });
    } catch (error) {
        console.error('Get single cause error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching cause',
            error: error.message
        });
    }
};

/**
 * @desc    Create new cause
 * @route   POST /api/causes
 * @access  Private (Admin)
 */
const createCause = async (req, res) => {
    try {
        const { name, description, category, color, icon } = req.body;

        // Check if cause already exists
        const existingCause = await Cause.findOne({ name });
        if (existingCause) {
            return res.status(400).json({
                success: false,
                message: 'Cause with this name already exists'
            });
        }

        const cause = await Cause.create({
            name,
            description,
            category: category.toLowerCase(),
            color: color || '#1fa750',
            icon: icon || '📋'
        });

        res.status(201).json({
            success: true,
            data: cause,
            message: 'Cause created successfully'
        });
    } catch (error) {
        console.error('Create cause error:', error);
        
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                error: message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error creating cause',
            error: error.message
        });
    }
};

/**
 * @desc    Update cause
 * @route   PUT /api/causes/:id
 * @access  Private (Admin)
 */
const updateCause = async (req, res) => {
    try {
        const { name, description, category, color, icon, isActive } = req.body;
        
        const cause = await Cause.findByIdAndUpdate(
            req.params.id,
            {
                ...(name && { name }),
                ...(description && { description }),
                ...(category && { category: category.toLowerCase() }),
                ...(color && { color }),
                ...(icon && { icon }),
                ...(typeof isActive === 'boolean' && { isActive })
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!cause) {
            return res.status(404).json({
                success: false,
                message: 'Cause not found'
            });
        }

        res.status(200).json({
            success: true,
            data: cause,
            message: 'Cause updated successfully'
        });
    } catch (error) {
        console.error('Update cause error:', error);
        
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                error: message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error updating cause',
            error: error.message
        });
    }
};

/**
 * @desc    Delete cause
 * @route   DELETE /api/causes/:id
 * @access  Private (Admin)
 */
const deleteCause = async (req, res) => {
    try {
        const cause = await Cause.findById(req.params.id);

        if (!cause) {
            return res.status(404).json({
                success: false,
                message: 'Cause not found'
            });
        }

        // Soft delete by setting isActive to false
        cause.isActive = false;
        await cause.save();

        res.status(200).json({
            success: true,
            message: 'Cause deleted successfully'
        });
    } catch (error) {
        console.error('Delete cause error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting cause',
            error: error.message
        });
    }
};

/**
 * @desc    Get cause categories
 * @route   GET /api/causes/categories
 * @access  Public
 */
const getCauseCategories = async (req, res) => {
    try {
        const categories = await Cause.distinct('category', { isActive: true });
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories.sort()
        });
    } catch (error) {
        console.error('Get cause categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching cause categories',
            error: error.message
        });
    }
};

export { 
    getAllCauses,
    getCausesByCategory,
    getSingleCause,
    createCause,
    updateCause,
    deleteCause,
    getCauseCategories
 };