// #!/usr/bin/env node

// /**
//  * Script to convert all backend files from CommonJS to ES6 imports
//  * Run: node convert-to-es6.js
//  */

// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Files to convert (relative to backend directory)
// const filesToConvert = [
//     // Models
//     'models/User.js',
//     'models/Course.js', 
//     'models/PastQuestion.js',
//     'models/PinnedVideo.js',
//     'models/Cause.js',
//     'models/UserVideoPreferences.js',
    
//     // Routes
//     'routes/auth.js',
//     'routes/courses.js',
//     'routes/pastQuestions.js',
//     'routes/videos.js',
//     'routes/pinnedVideos.js',
//     'routes/causes.js',
    
//     // Controllers
//     'controllers/authController.js',
//     'controllers/courseController.js',
//     'controllers/pastQuestionController.js',
//     'controllers/videoController.js',
//     'controllers/pinnedVideoController.js',
//     'controllers/causeController.js',
    
//     // Middleware
//     'middleware/auth.js',
//     'middleware/upload.js',
//     'middleware/analytics.js',
    
//     // Utils
//     'utils/seedData.js',
//     'utils/youtubeUtils.js',
//     'utils/mockVideoService.js',
//     'utils/videoUtils.js'
// ];

// function convertFile(filePath) {
//     const fullPath = path.join(__dirname, filePath);
    
//     if (!fs.existsSync(fullPath)) {
//         console.log(`⚠️  File not found: ${filePath}`);
//         return;
//     }
    
//     let content = fs.readFileSync(fullPath, 'utf8');
//     let originalContent = content;
    
//     // Convert require statements to imports
//     // Handle different require patterns
//     content = content.replace(/const (\w+) = require\(['"`]([^'"`]+)['"`]\);?/g, (match, varName, moduleName) => {
//         // Handle built-in modules or local modules with .js extension
//         if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
//             return `import ${varName} from '${moduleName}.js';`;
//         } else {
//             return `import ${varName} from '${moduleName}';`;
//         }
//     });
    
//     // Handle destructured imports
//     content = content.replace(/const \{ ([^}]+) \} = require\(['"`]([^'"`]+)['"`]\);?/g, (match, destructured, moduleName) => {
//         if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
//             return `import { ${destructured} } from '${moduleName}.js';`;
//         } else {
//             return `import { ${destructured} } from '${moduleName}';`;
//         }
//     });
    
//     // Convert module.exports to exports
//     content = content.replace(/module\.exports = (.+);/g, 'export default $1;');
//     content = content.replace(/module\.exports = \{([^}]+)\};/g, 'export { $1 };');
    
//     // Handle named exports in CommonJS style
//     content = content.replace(/module\.exports\.(\w+) = /g, 'export const $1 = ');
    
//     if (content !== originalContent) {
//         fs.writeFileSync(fullPath, content, 'utf8');
//         console.log(`✅ Converted: ${filePath}`);
//     } else {
//         console.log(`⏭️  No changes needed: ${filePath}`);
//     }
// }

// console.log('🔄 Starting ES6 conversion...\n');

// // Convert all files
// for (const file of filesToConvert) {
//     convertFile(file);
// }

// console.log('\n🎉 Conversion complete!');
// console.log('\n📝 Next steps:');
// console.log('1. Test your server: npm run dev');
// console.log('2. Fix any remaining issues manually');
// console.log('3. Update imports that may need tweaking');