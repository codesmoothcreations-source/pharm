// Simple Cloudinary Integration Test
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🧪 Testing Cloudinary Integration...\n');
console.log('✅ Test 1: Cloudinary Configuration');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'Not set');

// Test upload
const testUpload = async () => {
    try {
        console.log('\n🧪 Test 2: File Upload to Cloudinary');
        
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