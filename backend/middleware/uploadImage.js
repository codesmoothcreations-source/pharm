import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from '@fluidjs/multer-cloudinary';

/**
 * Configure multer for image uploads to Cloudinary
 * Separate configuration for image gallery feature
 */
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pharmssag-images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
        transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ]
    }
});

/**
 * File filter for image uploads only
 */
const imageFileFilter = (req, file, cb) => {
    const allowedImageTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp'
    ];
    
    if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format. Please upload image files only (JPEG, PNG, GIF, WebP, SVG, BMP).'), false);
    }
};

/**
 * Multer upload configuration for images
 * Max file size: 10MB for images
 */
const uploadImage = multer({
    storage: imageStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for images
    },
    fileFilter: imageFileFilter
});

export default uploadImage;
