# University Past Questions Platform

A modern, simplified web application for accessing university past questions and study resources. Built with React/Vite frontend and Node.js/Express backend.

## 🎨 New Features & Improvements

### ✅ Recent Enhancements
- **Simplified UI**: Clean, modern design with green, blue, white, and black color scheme
- **Better Sorting**: Enhanced course sorting with multiple options (name, questions count, downloads)
- **Streamlined Code**: Removed unnecessary complexity and improved readability
- **Improved Performance**: Better component structure and optimized loading
- **Responsive Design**: Mobile-friendly interface that works on all devices

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:5001`

### Frontend Setup
```bash
cd university-past-questions-frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3001`

## 📁 Project Structure

```
university-past-questions/
├── backend/                    # Node.js/Express API
│   ├── config/                # Database & cloudinary config
│   ├── controllers/           # API route handlers
│   ├── middleware/            # Auth & upload middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── uploads/              # File uploads
│   └── server.js             # Main server file
│
└── university-past-questions-frontend/  # React/Vite App
    ├── src/
    │   ├── components/       # Reusable components
    │   │   ├── admin/        # Admin panel components
    │   │   ├── auth/         # Authentication forms
    │   │   ├── common/       # Shared components
    │   │   └── user/         # User-facing components
    │   ├── pages/            # Main page components
    │   ├── context/          # React context providers
    │   ├── services/         # API service functions
    │   ├── utils/            # Helper functions
    │   └── styles/           # CSS styles
    ├── public/               # Static assets
    └── package.json
```

## 🎨 Design System

### Color Palette
- **Primary Green**: `#10b981` - Main action buttons and positive states
- **Secondary Green**: `#059669` - Hover states and secondary actions
- **Primary Blue**: `#3b82f6` - Links and interactive elements
- **Secondary Blue**: `#1d4ed8` - Hover states and active states
- **White**: `#ffffff` - Background and cards
- **Black**: `#000000` - Text and high contrast elements
- **Grays**: `#f9fafb` to `#111827` - Supporting colors

### Typography
- **Font Family**: Inter, Segoe UI, system-ui, sans-serif
- **Scale**: 12px to 36px with consistent ratios
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## ✨ Key Features

### 📚 Course Management
- Browse courses by level (100-500) and semester (1-2)
- Advanced sorting options (name, questions count, downloads)
- Real-time filtering and search
- Clean card-based layout

### 🎯 Improved UX
- **Simplified Navigation**: Streamlined header with clear actions
- **Better Loading States**: Clean loading spinners and error handling
- **Responsive Design**: Works perfectly on mobile and desktop
- **Accessible**: Proper ARIA labels and keyboard navigation

### 👨‍💼 Admin Features
- Easy-to-use admin dashboard
- Simple form for adding/editing questions
- Quick question management
- File upload support

## 🛠️ Technical Stack

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development
- **React Router** for navigation
- **Modern CSS** with CSS variables
- **Responsive design** principles

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Cloudinary** for file storage
- **JWT** authentication
- **CORS** enabled

## 📱 Pages & Components

### Main Pages
- **Home**: Hero section with quick stats and features
- **Courses**: Filterable course catalog with sorting
- **Search**: Advanced search functionality
- **Admin**: Admin dashboard for content management

### Key Components
- **Header**: Simplified navigation with user menu
- **CourseList**: Enhanced course display with sorting
- **CourseCard**: Clean course information display
- **LoadingSpinner**: Consistent loading states
- **ErrorBoundary**: Error handling

## 🎯 Recent Code Improvements

### What Was Simplified
1. **Removed unnecessary complexity** in React components
2. **Unified CSS system** with consistent variables
3. **Streamlined API calls** with better error handling
4. **Improved component structure** for better maintainability
5. **Enhanced sorting functionality** with multiple options

### Code Quality
- Consistent naming conventions
- Proper component separation
- Modern React patterns
- Clean CSS architecture
- Improved performance

## 🔧 Development Commands

```bash
# Backend
npm run dev        # Start development server
npm start          # Start production server

# Frontend  
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Past Questions
- `GET /api/past-questions` - Get all questions
- `GET /api/past-questions/:id` - Get single question
- `POST /api/past-questions` - Create question (admin)
- `PUT /api/past-questions/:id` - Update question (admin)
- `DELETE /api/past-questions/:id` - Delete question (admin)

### Videos
- `GET /api/videos/search` - Search video tutorials

## 🚀 Deployment

### Backend (Node.js)
1. Set environment variables
2. Run `npm install`
3. Run `npm start`

### Frontend (Static)
1. Run `npm run build`
2. Serve the `dist` folder

## 📊 Performance

- **Fast Loading**: Optimized bundle size
- **Responsive**: Works on all device sizes
- **Accessible**: WCAG compliant
- **SEO Friendly**: Proper meta tags and structure

## 🤝 Contributing

1. Follow the established code style
2. Use the provided color system
3. Keep components simple and focused
4. Test on multiple devices
5. Update documentation

## 📝 License

This project is for educational purposes.

---

**Built with ❤️ for university students**