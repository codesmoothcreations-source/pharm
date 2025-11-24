import Image from '../models/Image.js';
import { cloudinary } from '../config/cloudinary.js';

/**
 * @desc    Upload new image
 * @route   POST /api/images
 * @access  Private (requires authentication)
 */
export const uploadImage = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        const { title, description, tags, isPublic } = req.body;

        // Validate required fields
        if (!title) {
            // Delete uploaded file from Cloudinary if validation fails
            if (req.file.public_id) {
                await cloudinary.uploader.destroy(req.file.public_id);
            }
            return res.status(400).json({
                success: false,
                message: 'Please provide an image title'
            });
        }

        // Parse tags if provided as string
        let parsedTags = [];
        if (tags) {
            parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
        }

        // Create image document
        const image = await Image.create({
            title,
            description: description || '',
            cloudinaryId: req.file.public_id,
            imageUrl: req.file.url,
            secureUrl: req.file.secure_url,
            publicId: req.file.public_id,
            format: req.file.format,
            width: req.file.width,
            height: req.file.height,
            size: req.file.bytes,
            uploadedBy: req.user._id,
            tags: parsedTags,
            isPublic: isPublic !== undefined ? isPublic : true
        });

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: image
        });
    } catch (error) {
        console.error('Upload image error:', error);
        
        // Clean up uploaded file if database operation fails
        if (req.file && req.file.public_id) {
            try {
                await cloudinary.uploader.destroy(req.file.public_id);
            } catch (cleanupError) {
                console.error('Error cleaning up uploaded file:', cleanupError);
            }
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Error uploading image'
        });
    }
};

/**
 * @desc    Get all images (with filtering)
 * @route   GET /api/images
 * @access  Private (requires authentication)
 */
export const getImages = async (req, res) => {
    try {
        const { myImages, tags, search, page = 1, limit = 20 } = req.query;

        // Build query
        let query = {};

        // Filter by user's own images
        if (myImages === 'true') {
            query.uploadedBy = req.user._id;
        } else {
            // Show only public images from other users
            query.$or = [
                { uploadedBy: req.user._id },
                { isPublic: true }
            ];
        }

        // Filter by tags
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagArray };
        }

        // Search in title and description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const images = await Image.find(query)
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Image.countDocuments(query);

        res.status(200).json({
            success: true,
            count: images.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: images
        });
    } catch (error) {
        console.error('Get images error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching images'
        });
    }
};

/**
 * @desc    Get single image by ID
 * @route   GET /api/images/:id
 * @access  Private (requires authentication)
 */
export const getImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id)
            .populate('uploadedBy', 'name email');

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Check if user has permission to view this image
        if (!image.isPublic && image.uploadedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this image'
            });
        }

        res.status(200).json({
            success: true,
            data: image
        });
    } catch (error) {
        console.error('Get image error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching image'
        });
    }
};

/**
 * @desc    Update image metadata
 * @route   PUT /api/images/:id
 * @access  Private (requires authentication - owner only)
 */
export const updateImage = async (req, res) => {
    try {
        let image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Check if user is the owner
        if (image.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this image'
            });
        }

        const { title, description, tags, isPublic } = req.body;

        // Update fields
        if (title) image.title = title;
        if (description !== undefined) image.description = description;
        if (tags) {
            image.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
        }
        if (isPublic !== undefined) image.isPublic = isPublic;

        await image.save();

        res.status(200).json({
            success: true,
            message: 'Image updated successfully',
            data: image
        });
    } catch (error) {
        console.error('Update image error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating image'
        });
    }
};

/**
 * @desc    Delete image
 * @route   DELETE /api/images/:id
 * @access  Private (requires authentication - owner only)
 */
export const deleteImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Check if user is the owner
        if (image.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this image'
            });
        }

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(image.publicId);
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            // Continue with database deletion even if Cloudinary deletion fails
        }

        // Delete from database
        await image.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting image'
        });
    }
};

/**
 * @desc    Get user's image statistics
 * @route   GET /api/images/stats/me
 * @access  Private (requires authentication)
 */
export const getMyImageStats = async (req, res) => {
    try {
        const totalImages = await Image.countDocuments({ uploadedBy: req.user._id });
        const publicImages = await Image.countDocuments({ uploadedBy: req.user._id, isPublic: true });
        const privateImages = await Image.countDocuments({ uploadedBy: req.user._id, isPublic: false });

        // Get total storage used (in bytes)
        const images = await Image.find({ uploadedBy: req.user._id });
        const totalStorage = images.reduce((sum, img) => sum + (img.size || 0), 0);

        // Get most used tags
        const tagStats = await Image.aggregate([
            { $match: { uploadedBy: req.user._id } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalImages,
                publicImages,
                privateImages,
                totalStorage,
                totalStorageMB: (totalStorage / (1024 * 1024)).toFixed(2),
                topTags: tagStats
            }
        });
    } catch (error) {
        console.error('Get image stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching image statistics'
        });
    }
};
