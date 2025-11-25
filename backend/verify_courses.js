import mongoose from 'mongoose';
import Course from './models/Course.js';
import 'dotenv/config';

async function verifyCourses() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
        console.log(`📍 Connected to database: ${mongoose.connection.name}`);

        // Get all courses
        const allCourses = await Course.find({}).sort({ level: 1, semester: 1, courseCode: 1 });
        console.log(`📊 Total courses found: ${allCourses.length}`);

        if (allCourses.length === 0) {
            console.log('❌ No courses found in the database!');
        } else {
            console.log('\n📚 Courses in database:');
            allCourses.forEach((course, index) => {
                console.log(`${index + 1}. ${course.courseCode} - ${course.courseName} (Level ${course.level}, Sem ${course.semester})`);
            });

            // Check for Level 200 courses specifically
            const level200Courses = allCourses.filter(c => c.level === '200');
            console.log(`\n🎓 Level 200 courses found: ${level200Courses.length}`);

            if (level200Courses.length > 0) {
                console.log('Level 200 courses:');
                level200Courses.forEach((course, index) => {
                    console.log(`${index + 1}. ${course.courseCode} - ${course.courseName}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error verifying courses:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔐 MongoDB connection closed');
        process.exit(0);
    }
}

verifyCourses();