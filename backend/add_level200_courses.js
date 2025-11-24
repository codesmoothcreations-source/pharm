import mongoose from 'mongoose';
import Cause from './models/Cause.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Level 200 1st Semester Courses
const level200FirstSemCourses = [
    {
        name: 'Basic pharmaceutical Microbiology',
        description: 'Introduction to pharmaceutical microbiology, microorganisms, and their applications in pharmacy',
        category: 'Level 200 1st Sem',
        color: '#FF6B6B',
        icon: '🦠'
    },
    {
        name: 'Basic pharmaceutical Microbiology Practicals',
        description: 'Laboratory practicals for basic pharmaceutical microbiology',
        category: 'Level 200 1st Sem',
        color: '#4ECDC4',
        icon: '🧪'
    },
    {
        name: 'Therapeutics I',
        description: 'Introduction to therapeutics and clinical pharmacy practice',
        category: 'Level 200 1st Sem',
        color: '#45B7D1',
        icon: '💊'
    },
    {
        name: 'Basic Management',
        description: 'Fundamentals of management principles and practices',
        category: 'Level 200 1st Sem',
        color: '#96CEB4',
        icon: '📊'
    },
    {
        name: 'Physical Chemistry',
        description: 'Physical chemistry principles applied to pharmaceutical sciences',
        category: 'Level 200 1st Sem',
        color: '#FFEAA7',
        icon: '⚗️'
    },
    {
        name: 'Physical Chemistry Practicals',
        description: 'Laboratory practicals for physical chemistry',
        category: 'Level 200 1st Sem',
        color: '#DDA0DD',
        icon: '🔬'
    },
    {
        name: 'Hospital Practice III',
        description: 'Hospital pharmacy practice and clinical skills',
        category: 'Level 200 1st Sem',
        color: '#98D8C8',
        icon: '🏥'
    }
];

// Level 200 2nd Semester Courses
const level200SecondSemCourses = [
    {
        name: 'Quality Control and Instrumentation Technology I',
        description: 'Quality control methods and analytical instrumentation',
        category: 'Level 200 2nd Sem',
        color: '#F7DC6F',
        icon: '🔍'
    },
    {
        name: 'Quality Control and Instrumentation Technology Practicals I',
        description: 'Laboratory practicals for quality control and instrumentation',
        category: 'Level 200 2nd Sem',
        color: '#BB8FCE',
        icon: '⚖️'
    },
    {
        name: 'Store Keeping',
        description: 'Principles and practices of pharmaceutical store management',
        category: 'Level 200 2nd Sem',
        color: '#85C1E9',
        icon: '📦'
    },
    {
        name: 'Organic Chemistry IV',
        description: 'Advanced organic chemistry concepts and reactions',
        category: 'Level 200 2nd Sem',
        color: '#F8C471',
        icon: '🧬'
    },
    {
        name: 'Organic Chemistry practicals IV',
        description: 'Laboratory practicals for advanced organic chemistry',
        category: 'Level 200 2nd Sem',
        color: '#82E0AA',
        icon: '⚗️'
    },
    {
        name: 'Therapeutics II',
        description: 'Advanced therapeutics and clinical applications',
        category: 'Level 200 2nd Sem',
        color: '#F1948A',
        icon: '🩺'
    },
    {
        name: 'Research Methodology',
        description: 'Introduction to research methods and scientific writing',
        category: 'Level 200 2nd Sem',
        color: '#85929E',
        icon: '📚'
    },
    {
        name: 'Statistics',
        description: 'Statistical methods and data analysis for pharmaceutical sciences',
        category: 'Level 200 2nd Sem',
        color: '#D7BDE2',
        icon: '📈'
    }
];

// Function to add courses
const addCourses = async (courses, semester) => {
    console.log(`\n📚 Adding Level 200 ${semester} courses...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const course of courses) {
        try {
            // Check if course already exists
            const existingCourse = await Cause.findOne({ 
                name: course.name,
                category: course.category
            });
            
            if (existingCourse) {
                console.log(`⚠️  Skipped: ${course.name} (already exists)`);
                skippedCount++;
                continue;
            }
            
            // Create new course
            const newCourse = await Cause.create(course);
            console.log(`✅ Added: ${newCourse.name} (${newCourse.category})`);
            addedCount++;
            
        } catch (error) {
            console.error(`❌ Error adding ${course.name}:`, error.message);
            errorCount++;
        }
    }
    
    return { addedCount, skippedCount, errorCount };
};

// Main function
const main = async () => {
    try {
        console.log('🚀 Starting Level 200 courses addition...\n');
        
        // Connect to database
        await connectDB();
        
        // Add 1st semester courses
        const firstSemResults = await addCourses(level200FirstSemCourses, '1st Semester');
        
        // Add 2nd semester courses
        const secondSemResults = await addCourses(level200SecondSemCourses, '2nd Semester');
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY - Level 200 Courses Addition');
        console.log('='.repeat(60));
        console.log(`✅ Total Added: ${firstSemResults.addedCount + secondSemResults.addedCount}`);
        console.log(`⚠️  Total Skipped: ${firstSemResults.skippedCount + secondSemResults.skippedCount}`);
        console.log(`❌ Total Errors: ${firstSemResults.errorCount + secondSemResults.errorCount}`);
        console.log('\n1st Semester:');
        console.log(`  - Added: ${firstSemResults.addedCount}`);
        console.log(`  - Skipped: ${firstSemResults.skippedCount}`);
        console.log(`  - Errors: ${firstSemResults.errorCount}`);
        console.log('\n2nd Semester:');
        console.log(`  - Added: ${secondSemResults.addedCount}`);
        console.log(`  - Skipped: ${secondSemResults.skippedCount}`);
        console.log(`  - Errors: ${secondSemResults.errorCount}`);
        console.log('='.repeat(60));
        console.log('🎉 Level 200 courses addition completed!');
        
    } catch (error) {
        console.error('💥 Fatal error:', error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('\n🔒 Database connection closed');
    }
};

// Run the script
main();