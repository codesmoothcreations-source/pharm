const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

const pharmaceuticalCourses = [
    // ACADEMIC LEVEL 100 - SEMESTER 1
    { courseCode: 'AFR1001', courseName: 'African Studies', level: '100', semester: '1' },
    { courseCode: 'CMP1001', courseName: 'Computer Literacy', level: '100', semester: '1' },
    { courseCode: 'COM1001', courseName: 'Communication Skills I', level: '100', semester: '1' },
    { courseCode: 'DIS1001', courseName: 'Dispensing Techniques I', level: '100', semester: '1' },
    { courseCode: 'DIS1001P', courseName: 'Dispensing Techniques I (Practical Component)', level: '100', semester: '1' },
    { courseCode: 'CHEM1001', courseName: 'Chemistry I', level: '100', semester: '1' },
    { courseCode: 'CHEM1001P', courseName: 'Chemistry I (Practical Component)', level: '100', semester: '1' },
    { courseCode: 'PHY1001', courseName: 'Physiology I', level: '100', semester: '1' },
    { courseCode: 'FAD1001', courseName: 'First Aid', level: '100', semester: '1' },
    { courseCode: 'HSP1001', courseName: 'Hospital Practice I', level: '100', semester: '1' },

    // ACADEMIC LEVEL 100 - SEMESTER 2
    { courseCode: 'DIS1002', courseName: 'Dispensing Techniques II', level: '100', semester: '2' },
    { courseCode: 'DIS1002P', courseName: 'Dispensing Techniques II (Practical Component)', level: '100', semester: '2' },
    { courseCode: 'CHEM1002', courseName: 'Chemistry II', level: '100', semester: '2' },
    { courseCode: 'CHEM1002P', courseName: 'Chemistry II (Practical Component)', level: '100', semester: '2' },
    { courseCode: 'PHY1002', courseName: 'Physiology II', level: '100', semester: '2' },
    { courseCode: 'HSP1002', courseName: 'Hospital Practice II', level: '100', semester: '2' },
    { courseCode: 'COM1002', courseName: 'Communication Skills II', level: '100', semester: '2' },
    { courseCode: 'AFR1002', courseName: 'African Studies', level: '100', semester: '2' },

    // ACADEMIC LEVEL 200 - SEMESTER 1
    { courseCode: 'MIC2001', courseName: 'Basic Pharmaceutical Microbiology', level: '200', semester: '1' },
    { courseCode: 'MIC2001P', courseName: 'Basic Pharmaceutical Microbiology (Practical Component)', level: '200', semester: '1' },
    { courseCode: 'THER2001', courseName: 'Therapeutics I', level: '200', semester: '1' },
    { courseCode: 'HSP2001', courseName: 'Hospital Practice III', level: '200', semester: '1' },
    { courseCode: 'FOR2001', courseName: 'Forensic I', level: '200', semester: '1' },
    { courseCode: 'MGT2001', courseName: 'Basic Management', level: '200', semester: '1' },
    { courseCode: 'PCH2001', courseName: 'Physical Chemistry', level: '200', semester: '1' },
    { courseCode: 'PCH2001P', courseName: 'Physical Chemistry (Practical Component)', level: '200', semester: '1' },
    { courseCode: 'ENT2001', courseName: 'Pharmaceutical Entrepreneurship', level: '200', semester: '1' },

    // ACADEMIC LEVEL 200 - SEMESTER 2
    { courseCode: 'QCI2001', courseName: 'Quality Control and Instrumentation Technology I', level: '200', semester: '2' },
    { courseCode: 'QCI2001P', courseName: 'Quality Control and Instrumentation Technology I (Practical Component)', level: '200', semester: '2' },
    { courseCode: 'DIS2001', courseName: 'Dispensing Techniques III', level: '200', semester: '2' },
    { courseCode: 'DIS2001P', courseName: 'Dispensing Techniques III (Practical Component)', level: '200', semester: '2' },
    { courseCode: 'STK2001', courseName: 'Store Keeping', level: '200', semester: '2' },
    { courseCode: 'ORG2001', courseName: 'Organic Chemistry IV', level: '200', semester: '2' },
    { courseCode: 'ORG2001P', courseName: 'Organic Chemistry IV (Practical Component)', level: '200', semester: '2' },
    { courseCode: 'THER2002', courseName: 'Therapeutics II', level: '200', semester: '2' },
    { courseCode: 'RES2001', courseName: 'Research Methodology', level: '200', semester: '2' },
    { courseCode: 'STAT2001', courseName: 'Statistics', level: '200', semester: '2' }
];

async function populatePharmaceuticalCourses() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing courses
        console.log('🧹 Clearing existing courses...');
        await Course.deleteMany({});
        console.log('✅ Cleared existing courses');

        // Ensure the user's requested Level 200 courses are present (avoid duplicates)
        const additionalCourses = [
            // Level 200 - Semester 1
            { courseCode: 'MIC2001', courseName: 'Basic Pharmaceutical Microbiology', level: '200', semester: '1' },
            { courseCode: 'MIC2001P', courseName: 'Basic Pharmaceutical Microbiology (Practical Component)', level: '200', semester: '1' },
            { courseCode: 'THER2001', courseName: 'Therapeutics I', level: '200', semester: '1' },
            { courseCode: 'MGT2001', courseName: 'Basic Management', level: '200', semester: '1' },
            { courseCode: 'PCH2001', courseName: 'Physical Chemistry', level: '200', semester: '1' },
            { courseCode: 'PCH2001P', courseName: 'Physical Chemistry (Practical Component)', level: '200', semester: '1' },
            { courseCode: 'HSP2001', courseName: 'Hospital Practice III', level: '200', semester: '1' },

            // Level 200 - Semester 2
            { courseCode: 'QCI2001', courseName: 'Quality Control and Instrumentation Technology I', level: '200', semester: '2' },
            { courseCode: 'QCI2001P', courseName: 'Quality Control and Instrumentation Technology I (Practical Component)', level: '200', semester: '2' },
            { courseCode: 'STK2001', courseName: 'Store Keeping', level: '200', semester: '2' },
            { courseCode: 'ORG2001', courseName: 'Organic Chemistry IV', level: '200', semester: '2' },
            { courseCode: 'ORG2001P', courseName: 'Organic Chemistry IV (Practical Component)', level: '200', semester: '2' },
            { courseCode: 'THER2002', courseName: 'Therapeutics II', level: '200', semester: '2' },
            { courseCode: 'RES2001', courseName: 'Research Methodology', level: '200', semester: '2' },
            { courseCode: 'STAT2001', courseName: 'Statistics', level: '200', semester: '2' }
        ];

        // Merge additional courses into the main list without duplicating by courseCode
        const allCourses = [...pharmaceuticalCourses];
        additionalCourses.forEach((c) => {
            if (!allCourses.some(existing => existing.courseCode === c.courseCode)) {
                allCourses.push(c);
            }
        });

        // Insert new pharmaceutical sciences courses
        console.log('💊 Inserting pharmaceutical sciences course catalogue...');
        const insertedCourses = await Course.insertMany(allCourses);
        console.log(`✅ Successfully inserted ${insertedCourses.length} pharmaceutical sciences courses`);

        // Display summary by level and semester
        const level100Sem1 = insertedCourses.filter(c => c.level === '100' && c.semester === '1');
        const level100Sem2 = insertedCourses.filter(c => c.level === '100' && c.semester === '2');
        const level200Sem1 = insertedCourses.filter(c => c.level === '200' && c.semester === '1');
        const level200Sem2 = insertedCourses.filter(c => c.level === '200' && c.semester === '2');

        console.log('\n📊 Pharmaceutical Sciences Course Summary:');
        console.log(`ACADEMIC LEVEL 100 - SEMESTER 1: ${level100Sem1.length} courses`);
        console.log(`ACADEMIC LEVEL 100 - SEMESTER 2: ${level100Sem2.length} courses`);
        console.log(`ACADEMIC LEVEL 200 - SEMESTER 1: ${level200Sem1.length} courses`);
        console.log(`ACADEMIC LEVEL 200 - SEMESTER 2: ${level200Sem2.length} courses`);
        console.log(`TOTAL: ${insertedCourses.length} courses`);

        // Display detailed course catalogue by academic framework
        console.log('\n📖 Complete Pharmaceutical Sciences Course Catalogue:');
        
        console.log('\n🎓 ACADEMIC LEVEL 100 - SEMESTER 1');
        level100Sem1.forEach((course, index) => {
            console.log(`${index + 1}. ${course.courseCode} - ${course.courseName}`);
        });

        console.log('\n🎓 ACADEMIC LEVEL 100 - SEMESTER 2');
        level100Sem2.forEach((course, index) => {
            console.log(`${index + 1}. ${course.courseCode} - ${course.courseName}`);
        });

        console.log('\n🎓 ACADEMIC LEVEL 200 - SEMESTER 1');
        level200Sem1.forEach((course, index) => {
            console.log(`${index + 1}. ${course.courseCode} - ${course.courseName}`);
        });

        console.log('\n🎓 ACADEMIC LEVEL 200 - SEMESTER 2');
        level200Sem2.forEach((course, index) => {
            console.log(`${index + 1}. ${course.courseCode} - ${course.courseName}`);
        });

        console.log('\n✅ Pharmaceutical Sciences curriculum successfully populated');

    } catch (error) {
        console.error('❌ Error populating pharmaceutical sciences courses:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔐 MongoDB connection closed');
        process.exit(0);
    }
}

populatePharmaceuticalCourses();