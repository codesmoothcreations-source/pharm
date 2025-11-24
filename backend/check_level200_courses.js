import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function checkCourses() {
    try {
        console.log('🔍 Checking Level 200 courses in database...\n');
        
        // Get all causes
        const causesResponse = await axios.get(`${API_BASE}/causes`);
        const allCauses = causesResponse.data.data;
        
        // Filter Level 200 courses
        const level200FirstSem = allCauses.filter(course => course.category === 'Level 200 1st Sem');
        const level200SecondSem = allCauses.filter(course => course.category === 'Level 200 2nd Sem');
        
        console.log(`📚 Level 200 1st Semester courses (${level200FirstSem.length}):`);
        level200FirstSem.forEach((course, index) => {
            console.log(`${index + 1}. ${course.name} ${course.icon}`);
        });
        
        console.log(`\n📚 Level 200 2nd Semester courses (${level200SecondSem.length}):`);
        level200SecondSem.forEach((course, index) => {
            console.log(`${index + 1}. ${course.name} ${course.icon}`);
        });
        
        console.log(`\n✅ Total Level 200 courses: ${level200FirstSem.length + level200SecondSem.length}`);
        
        // Get all categories
        const categoriesResponse = await axios.get(`${API_BASE}/causes/categories`);
        const categories = categoriesResponse.data.data;
        
        console.log(`\n📋 All Categories: ${categories.join(', ')}`);
        
    } catch (error) {
        console.error('❌ Error checking courses:', error.message);
    }
}

checkCourses();