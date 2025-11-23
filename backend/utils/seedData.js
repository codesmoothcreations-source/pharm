import mongoose from 'mongoose';
import Course from '../models/Course.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Seed initial courses data
 */
const seedCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Clear existing courses
        await Course.deleteMany();
        console.log('🗑️  Existing courses cleared');

        // Level 100 - 1st Semester Courses
        const level100FirstSem = [
            { courseCode: 'PHAR101', courseName: 'African Studies', level: '100', semester: '1' },
            { courseCode: 'PHAR102', courseName: 'Computer Literacy', level: '100', semester: '1' },
            { courseCode: 'PHAR103', courseName: 'Communication Skills I', level: '100', semester: '1' },
            { courseCode: 'PHAR104', courseName: 'Dispensing Techniques I', level: '100', semester: '1' },
            { courseCode: 'PHAR105', courseName: 'Dispensing Techniques Practicals I', level: '100', semester: '1' },
            { courseCode: 'PHAR106', courseName: 'Chemistry I', level: '100', semester: '1' },
            { courseCode: 'PHAR107', courseName: 'Chemistry Practicals I', level: '100', semester: '1' },
            { courseCode: 'PHAR108', courseName: 'Physiology I', level: '100', semester: '1' },
            { courseCode: 'PHAR109', courseName: 'First Aid', level: '100', semester: '1' },
            { courseCode: 'PHAR110', courseName: 'Hospital Practice I', level: '100', semester: '1' }
        ];

        // Level 100 - 2nd Semester Courses
        const level100SecondSem = [
            { courseCode: 'PHAR111', courseName: 'Dispensing Techniques II', level: '100', semester: '2' },
            { courseCode: 'PHAR112', courseName: 'Dispensing Techniques Practicals II', level: '100', semester: '2' },
            { courseCode: 'PHAR113', courseName: 'Chemistry II', level: '100', semester: '2' },
            { courseCode: 'PHAR114', courseName: 'Chemistry Practicals II', level: '100', semester: '2' },
            { courseCode: 'PHAR115', courseName: 'Physiology II', level: '100', semester: '2' },
            { courseCode: 'PHAR116', courseName: 'Hospital Practice II', level: '100', semester: '2' },
            { courseCode: 'PHAR117', courseName: 'Communication Skills II', level: '100', semester: '2' },
            { courseCode: 'PHAR118', courseName: 'African Studies', level: '100', semester: '2' }
        ];

        // Level 200 - 1st Semester Courses
        const level200FirstSem = [
            { courseCode: 'PHAR201', courseName: 'Basic Pharmaceutical Microbiology', level: '200', semester: '1' },
            { courseCode: 'PHAR202', courseName: 'Basic Pharmaceutical Microbiology Practicals', level: '200', semester: '1' },
            { courseCode: 'PHAR203', courseName: 'Therapeutics I', level: '200', semester: '1' },
            { courseCode: 'PHAR204', courseName: 'Hospital Practice III', level: '200', semester: '1' },
            { courseCode: 'PHAR205', courseName: 'Forensic I', level: '200', semester: '1' },
            { courseCode: 'PHAR206', courseName: 'Basic Management', level: '200', semester: '1' },
            { courseCode: 'PHAR207', courseName: 'Physical Chemistry', level: '200', semester: '1' },
            { courseCode: 'PHAR208', courseName: 'Physical Chemistry Practicals', level: '200', semester: '1' },
            { courseCode: 'PHAR209', courseName: 'Pharmaceutical Entrepreneurship', level: '200', semester: '1' }
        ];

        // Level 200 - 2nd Semester Courses
        const level200SecondSem = [
            { courseCode: 'PHAR210', courseName: 'Quality Control and Instrumentation Technology I', level: '200', semester: '2' },
            { courseCode: 'PHAR211', courseName: 'Quality Control and Instrumentation Technology Practicals I', level: '200', semester: '2' },
            { courseCode: 'PHAR212', courseName: 'Dispensing Techniques III', level: '200', semester: '2' },
            { courseCode: 'PHAR213', courseName: 'Dispensing Techniques Practicals III', level: '200', semester: '2' },
            { courseCode: 'PHAR214', courseName: 'Store Keeping', level: '200', semester: '2' },
            { courseCode: 'PHAR215', courseName: 'Organic Chemistry IV', level: '200', semester: '2' },
            { courseCode: 'PHAR216', courseName: 'Organic Chemistry Practicals IV', level: '200', semester: '2' },
            { courseCode: 'PHAR217', courseName: 'Therapeutics II', level: '200', semester: '2' },
            { courseCode: 'PHAR218', courseName: 'Research Methodology', level: '200', semester: '2' },
            { courseCode: 'PHAR219', courseName: 'Statistics', level: '200', semester: '2' }
        ];

        // Combine all courses
        const allCourses = [
            ...level100FirstSem,
            ...level100SecondSem,
            ...level200FirstSem,
            ...level200SecondSem
        ];

        // Insert courses
        await Course.insertMany(allCourses);
        console.log(`✅ ${allCourses.length} courses seeded successfully`);

        // Create default admin user if not exists
        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (!adminExists) {
            await User.create({
                name: 'System Administrator',
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin',
                department: 'Pharmacy'
            });
            console.log('✅ Default admin user created');
        }

        console.log('🎉 Database seeding completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

// Run seeding if called directly
if (require.main === module) {
    seedCourses();
}

export default seedCourses;