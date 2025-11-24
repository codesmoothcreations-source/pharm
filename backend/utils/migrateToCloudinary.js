import PastQuestion from '../models/PastQuestion.js';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Migrate existing local files to Cloudinary
 * This script uploads all existing local files to Cloudinary and updates the database
 */
const migrateToCloudinary = async () => {
    try {
        console.log('🚀 Starting migration to Cloudinary...');

        // Find all past questions that don't have cloudinaryPublicId
        const pastQuestions = await PastQuestion.find({
            cloudinaryPublicId: { $exists: false }
        });

        console.log(`Found ${pastQuestions.length} files to migrate`);

        let migrated = 0;
        let failed = 0;

        for (const question of pastQuestions) {
            try {
                // Build local file path
                const filePath = path.join(__dirname, '..', question.fileUrl);
                
                // Check if file exists locally
                try {
                    await fs.access(filePath);
                } catch (error) {
                    console.log(`❌ File not found: ${filePath}`);
                    failed++;
                    continue;
                }

                // Read file and upload to Cloudinary
                const fileBuffer = await fs.readFile(filePath);
                
                // Upload to Cloudinary using buffer
                const uploadResult = await cloudinary.uploader.upload_stream(
                    {
                        folder: 'pharmssag-past-questions',
                        resource_type: 'auto',
                        public_id: `question_${question._id}_${Date.now()}`
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                        }
                    }
                );

                // Convert buffer to stream and upload
                const stream = cloudinary.uploader.upload_stream({
                    folder: 'pharmssag-past-questions',
                    resource_type: 'auto',
                    public_id: `question_${question._id}_${Date.now()}`
                });

                // Write buffer to stream
                stream.end(fileBuffer);

                // Wait for upload completion (simplified approach)
                const uploadData = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream({
                        folder: 'pharmssag-past-questions',
                        resource_type: 'auto',
                        public_id: `question_${question._id}_${Date.now()}`,
                        overwrite: true
                    }, (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    });

                    uploadStream.end(fileBuffer);
                });

                // Update database with Cloudinary info
                question.cloudinaryPublicId = uploadData.public_id;
                question.fileUrl = uploadData.secure_url;
                await question.save();

                console.log(`✅ Migrated: ${question.title}`);
                migrated++;

            } catch (error) {
                console.error(`❌ Failed to migrate ${question.title}:`, error.message);
                failed++;
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`✅ Successfully migrated: ${migrated} files`);
        console.log(`❌ Failed to migrate: ${failed} files`);
        console.log(`🎯 Total processed: ${pastQuestions.length} files`);

        return { migrated, failed, total: pastQuestions.length };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateToCloudinary()
        .then((result) => {
            console.log('🎉 Migration completed:', result);
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

export default migrateToCloudinary;