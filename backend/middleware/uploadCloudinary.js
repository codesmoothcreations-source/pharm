import multer from 'multer';
import { cloudinary } from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Configure multer for memory storage (files will be uploaded to Cloudinary)
 */
const storage = multer.memoryStorage();

/**
 * File filter for allowed types - matching frontend validation
 */
const fileFilter = (req, file, cb) => {
    // Allow all file types supported by frontend
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format. Please upload PDF, Word, PowerPoint, image, or text files.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit to match frontend
    },
    fileFilter: fileFilter
});

/**
 * Middleware function to upload file to Cloudinary
 * This middleware should be used after the multer upload middleware
 */
export const uploadToCloudinary = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        console.log('Uploading file to Cloudinary:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Determine the resource type based on mimetype
        let resourceType = 'auto';
        if (req.file.mimetype.startsWith('image/')) {
            resourceType = 'image';
        } else if (req.file.mimetype === 'application/pdf') {
            resourceType = 'raw'; // PDFs are treated as raw files in Cloudinary
        } else {
            resourceType = 'raw'; // Documents (DOC, DOCX, PPT, PPTX) as raw files
        }

        // Create a readable stream from the buffer
        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);

        // Upload to Cloudinary
        const uploadOptions = {
            resource_type: resourceType,
            folder: 'university-past-questions',
            public_id: `question-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
            use_filename: true,
            unique_filename: false,
            overwrite: false
        };

        console.log('Cloudinary upload options:', uploadOptions);

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('Cloudinary upload successful:', result.public_id);
                        resolve(result);
                    }
                }
            );
            
            readableStream.pipe(uploadStream);
        });

        // Transform the result to match what the controller expects
        req.file.cloudinaryResult = {
            secure_url: result.secure_url,
            public_id: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type,
            bytes: result.bytes
        };

        // Override the original file properties to match the expected interface
        req.file.path = result.secure_url;
        req.file.size = result.bytes;
        req.file.filename = result.public_id;

        next();
    } catch (error) {
        console.error('Cloudinary upload middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload file to Cloudinary',
            error: error.message
        });
    }
};

export default upload;