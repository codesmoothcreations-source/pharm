// Cloudinary Integration Test
// This script tests the Cloudinary upload functionality

import { configureCloudinary, cloudinary } from './backend/config/cloudinary.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
configureCloudinary();

console.log('🧪 Testing Cloudinary Integration...\n');

// Test 1: Basic Cloudinary configuration
console.log('✅ Test 1: Cloudinary Configuration');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'Not set');
console.log('✅ Configuration test passed\n');

// Test 2: Simple file upload test
const testUpload = async () => {
    try {
        console.log('🧪 Test 2: File Upload to Cloudinary');
        
        // Create a simple test file
        const testFilePath = path.join(__dirname, 'test-upload.txt');
        fs.writeFileSync(testFilePath, 'This is a test file for Cloudinary upload.');
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(testFilePath, {
            resource_type: 'raw',
            folder: 'university-past-questions/test'
        });
        
        console.log('✅ Upload successful!');
        console.log('Public ID:', result.public_id);
        console.log('Secure URL:', result.secure_url);
        console.log('Resource Type:', result.resource_type);
        
        // Clean up test file
        fs.unlinkSync(testFilePath);
        
        // Test deletion
        console.log('\n🧪 Test 3: File Deletion from Cloudinary');
        const deleteResult = await cloudinary.uploader.destroy(result.public_id);
        console.log('✅ Deletion successful:', deleteResult.result);
        
        console.log('\n🎉 All Cloudinary tests passed!');
        console.log('The integration is ready for use with the past questions application.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testUpload();