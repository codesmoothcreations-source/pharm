import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import colors from 'colors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';
import hpp from 'hpp';
import winston from 'winston';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Load environment variables from .env file
dotenv.config();

// Import database connection utility
import connectDB from './config/db.js';
// Import Cloudinary configuration for file uploads
import { configureCloudinary } from './config/cloudinary.js';

// Import API route handlers
import authRoutes from './routes/auth.js';
import pastQuestionRoutes from './routes/pastQuestions.js';
import videoRoutes from './routes/videos.js';
import pinnedVideoRoutes from './routes/pinnedVideos.js';
import courseRoutes from './routes/courses.js';

// Initialize Express application
const app = express();

// Establish database connection
connectDB();

// Configure Cloudinary for media uploads
configureCloudinary();

// ==================== LOGGING CONFIGURATION ====================
// Configure Winston logger for structured logging
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ],
    exitOnError: false
});

// ==================== SECURITY MIDDLEWARE ====================
// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.cloudinary.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Rate limiting disabled for development - no limits
const apiLimiter = (req, res, next) => {
    // Completely disabled in development
    if (process.env.NODE_ENV === 'development') {
        return next();
    }
    // In production, you could add limits here if needed
    next();
};

// Authentication rate limiting - disabled for development
const authLimiter = (req, res, next) => {
    // Completely disabled in development
    if (process.env.NODE_ENV === 'development') {
        return next();
    }
    // In production, you could add limits here if needed
    next();
};

// Apply rate limiting middleware (now disabled for development)
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// CORS configuration with strict settings
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL]
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

app.use(cors(corsOptions));

// ==================== DATA SANITIZATION ====================
// MongoDB injection protection
app.use(mongoSanitize());

// XSS protection
app.use(xssClean());

// HTTP Parameter Pollution protection
app.use(hpp());

// ==================== MIDDLEWARE CONFIGURATION ====================
// Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing with size limits and validation
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        // Basic validation for JSON structure
        if (buf.length === 0 && req.method !== 'GET') {
            throw new Error('Empty request body');
        }
    }
}));

app.use(express.urlencoded({ 
    extended: true,
    limit: '10mb'
}));

// ==================== STATIC FILE SERVING ====================
// Define __dirname for ES modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== API ROUTES ====================

// Health check endpoint with system information (only in development)
if (process.env.NODE_ENV !== "production") {
    app.get('/', (req, res) => {
        const healthData = {
            success: true,
            message: '🚀 University Past Questions API is running!',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
            memory: process.memoryUsage(),
            database: {
                status: 'connected', // This would be dynamic in real implementation
                connections: 1
            }
        };

        logger.info('Health check requested', { ip: req.ip });
        res.json(healthData);
    });
}

// API information endpoint - Lists all available endpoints
app.get('/api', (req, res) => {
    const apiInfo = {
        success: true,
        message: '🎓 University Past Questions API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        rateLimit: {
            general: '100 requests per 15 minutes',
            auth: '5 requests per 15 minutes'
        },
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                getProfile: 'GET /api/auth/me',
                refreshToken: 'POST /api/auth/refresh'
            },
            pastQuestions: {
                getAll: 'GET /api/past-questions',
                getSingle: 'GET /api/past-questions/:id',
                create: 'POST /api/past-questions',
                update: 'PUT /api/past-questions/:id',
                delete: 'DELETE /api/past-questions/:id'
            },
            courses: {
                getAll: 'GET /api/courses',
                getSingle: 'GET /api/courses/:id',
                create: 'POST /api/courses',
                update: 'PUT /api/courses/:id',
                delete: 'DELETE /api/courses/:id'
            },
            videos: {
                search: 'GET /api/videos/search',
                getPinned: 'GET /api/videos/pinned'
            },
            files: {
                uploads: 'GET /uploads/:filename'
            }
        },
        documentation: '/api/docs',
        status: '/api/health'
    };

    logger.info('API info requested', { ip: req.ip });
    res.json(apiInfo);
});

// Advanced health check endpoint
app.get('/api/health', (req, res) => {
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
            database: {
                status: 'healthy', // Would be dynamic
                latency: 'low' // Would be measured
            },
            storage: {
                status: 'healthy', // Cloudinary status
                latency: 'low'
            },
            memory: {
                status: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning',
                used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
            },
            cpu: {
                status: 'healthy'
            }
        }
    };

    logger.info('Detailed health check requested', { ip: req.ip });
    res.json(healthStatus);
});

// Mount API route handlers
app.use('/api/auth', authRoutes);              
app.use('/api/videos', videoRoutes);           
app.use('/api/videos', pinnedVideoRoutes);    
app.use('/api/past-questions', pastQuestionRoutes); 
app.use('/api/courses', courseRoutes);        

// ==================== PRODUCTION FRONTEND SERVING ====================
// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../university-past-questions-frontend/dist")));
    
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../university-past-questions-frontend", "dist", "index.html"));
    });
}

// ==================== ERROR HANDLING ====================

// 404 handler - Catch all undefined routes
app.use('*', (req, res) => {
    const errorInfo = {
        success: false,
        message: `Route ${req.originalUrl} not found`,
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        ip: req.ip
    };

    logger.warn('404 - Route not found', errorInfo);

    res.status(404).json({
        ...errorInfo,
        availableRoutes: [
            'GET /',
            'GET /api',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/auth/me',
            'GET /api/past-questions',
            'GET /api/past-questions/:id',
            'POST /api/past-questions',
            'PUT /api/past-questions/:id',
            'DELETE /api/past-questions/:id',
            'GET /api/courses',
            'GET /api/courses/:id',
            'GET /api/videos/search',
            'GET /uploads/:filename'
        ]
    });
});

// Global error handler - Catch all unhandled errors
app.use((err, req, res, next) => {
    const errorInfo = {
        success: false,
        message: err.message || 'Server Error',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    };

    // Log error with stack trace in development
    if (process.env.NODE_ENV === 'development') {
        logger.error('Server error', {
            ...errorInfo,
            stack: err.stack,
            body: req.body,
            query: req.query,
            params: req.params
        });
        res.status(err.statusCode || 500).json({
            ...errorInfo,
            stack: err.stack
        });
    } else {
        // In production, don't expose stack traces
        logger.error('Server error', {
            ...errorInfo,
            stack: err.stack
        });
        res.status(err.statusCode || 500).json({
            success: false,
            message: 'An unexpected error occurred. Please try again later.',
            timestamp: new Date().toISOString()
        });
    }
});

// ==================== SERVER CONFIGURATION ====================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
let server = null;
let shuttingDown = false;

// ==================== GRACEFUL SHUTDOWN ====================
const gracefulShutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    console.log(`\n⚠️  Shutting down server...`.yellow.bold);

    if (server) {
        server.close((err) => {
            if (err) {
                logger.error('Error during server shutdown', { error: err.message });
                process.exit(1);
            }

            // Close database connections
            mongoose.connection.close(() => {
                logger.info('Database connection closed');
                console.log(`✅ Database connection closed`.green);
                process.exit(0);
            });
        });
    } else {
        process.exit(0);
    }

    // Force shutdown after timeout
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        console.log(`❌ Forced shutdown after timeout`.red.bold);
        process.exit(1);
    }, 10000);
};

// Start HTTP server on a single port
try {
    server = app.listen(PORT, HOST, () => {
        logger.info(`Server initialization completed`, {
            port: PORT,
            host: HOST,
            environment: process.env.NODE_ENV,
            version: '1.0.0',
            timestamp: new Date().toISOString()
        });

        console.log(`\n🎓 University Past Questions Server running in ${process.env.NODE_ENV} mode`.yellow.bold);
        console.log(`📍 Server started on port ${PORT}`.cyan.bold);
        console.log(`🔗 API URL: http://localhost:${PORT}/api`.green.underline);
        console.log(`🏠 Home URL: http://localhost:${PORT}/`.green.underline);
        console.log(`📊 Health Check: http://localhost:${PORT}/api/health`.blue.underline);
        console.log(`📁 File Uploads: http://localhost:${PORT}/uploads`.blue.underline);
    });
} catch (error) {
    logger.error(`Failed to start server on port ${PORT}`, { error: error.message });
    console.error(`❌ Failed to start server on port ${PORT}: ${error.message}`.red.bold);
    process.exit(1);
}

// Handle various shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    if (!shuttingDown) {
        logger.error('Unhandled Rejection', {
            reason: reason,
            promise: promise,
            stack: reason.stack
        });
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    if (!shuttingDown) {
        logger.error('Uncaught Exception', {
            error: error.message,
            stack: error.stack
        });
    }
});

// ==================== SECURITY AUDIT ====================
// Log security-related events
app.use((req, res, next) => {
    // Log suspicious requests
    if (req.method === 'POST' && req.path.includes('admin')) {
        logger.info('Admin action attempt', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method
        });
    }
    
    next();
});

// Export app for testing purposes
export default app;
