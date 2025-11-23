/**
 * Configuration Management System for Traffic Handler
 * Centralized configuration handling with environment-specific overrides
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

class TrafficHandlerConfig {
    constructor(configPath = null) {
        this.configPath = configPath || path.join(__dirname, '../config/traffic-handler.config.js');
        this.environment = process.env.NODE_ENV || 'development';
        this.config = {};
        
        this.loadConfiguration();
    }

    /**
     * Load configuration from multiple sources
     */
    loadConfiguration() {
        // Load environment variables
        dotenv.config();
        
        // Load base configuration
        this.loadBaseConfig();
        
        // Load environment-specific overrides
        this.loadEnvironmentConfig();
        
        // Load from environment variables (highest priority)
        this.loadFromEnv();
        
        // Validate configuration
        this.validateConfig();
    }

    /**
     * Load base configuration
     */
    loadBaseConfig() {
        this.config = {
            // Rate Limiting Configuration
            rateLimiting: {
                windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
                maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
                skipSuccessfulRequests: false,
                skipFailedRequests: false,
                keyGenerator: (req) => {
                    return req.user?.id || req.ip;
                },
                headers: {
                    'Retry-After': 'retry-after'
                }
            },
            
            // Load Balancing Configuration
            loadBalancing: {
                strategy: process.env.LOAD_BALANCER_STRATEGY || 'round-robin', // round-robin, weighted, least-connections, response-time
                healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
                circuitBreakerThreshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD) || 5,
                circuitBreakerTimeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 60000, // 1 minute
                backends: [
                    {
                        name: 'primary',
                        url: process.env.PRIMARY_BACKEND_URL || 'http://localhost:5001',
                        weight: parseInt(process.env.PRIMARY_WEIGHT) || 5,
                        healthCheck: process.env.PRIMARY_HEALTH_CHECK || '/health',
                        timeout: parseInt(process.env.PRIMARY_TIMEOUT) || 5000
                    },
                    {
                        name: 'secondary',
                        url: process.env.SECONDARY_BACKEND_URL || 'http://localhost:5002',
                        weight: parseInt(process.env.SECONDARY_WEIGHT) || 3,
                        healthCheck: process.env.SECONDARY_HEALTH_CHECK || '/health',
                        timeout: parseInt(process.env.SECONDARY_TIMEOUT) || 5000
                    }
                ]
            },
            
            // Connection Pooling Configuration
            connectionPooling: {
                database: {
                    max: parseInt(process.env.DB_MAX_CONNECTIONS) || 100,
                    min: parseInt(process.env.DB_MIN_CONNECTIONS) || 10,
                    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
                    createTimeout: parseInt(process.env.DB_CREATE_TIMEOUT) || 30000,
                    destroyTimeout: parseInt(process.env.DB_DESTROY_TIMEOUT) || 5000,
                    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
                    reapInterval: parseInt(process.env.DB_REAP_INTERVAL) || 1000
                },
                redis: {
                    max: parseInt(process.env.REDIS_MAX_CONNECTIONS) || 50,
                    min: parseInt(process.env.REDIS_MIN_CONNECTIONS) || 5,
                    acquireTimeout: parseInt(process.env.REDIS_ACQUIRE_TIMEOUT) || 30000,
                    createTimeout: parseInt(process.env.REDIS_CREATE_TIMEOUT) || 10000,
                    destroyTimeout: parseInt(process.env.REDIS_DESTROY_TIMEOUT) || 1000,
                    idleTimeout: parseInt(process.env.REDIS_IDLE_TIMEOUT) || 10000,
                    reapInterval: parseInt(process.env.REDIS_REAP_INTERVAL) || 1000
                },
                http: {
                    maxSockets: parseInt(process.env.HTTP_MAX_SOCKETS) || 50,
                    maxFreeSockets: parseInt(process.env.HTTP_MAX_FREE_SOCKETS) || 10,
                    timeout: parseInt(process.env.HTTP_TIMEOUT) || 60000,
                    keepAlive: process.env.HTTP_KEEP_ALIVE !== 'false'
                }
            },
            
            // Request Queuing Configuration
            requestQueue: {
                maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE) || 1000,
                queueTimeout: parseInt(process.env.QUEUE_TIMEOUT) || 30000, // 30 seconds
                priorityLevels: parseInt(process.env.PRIORITY_LEVELS) || 5,
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT) || 6379,
                    password: process.env.REDIS_PASSWORD || null,
                    db: parseInt(process.env.REDIS_DB) || 0
                }
            },
            
            // Security Configuration
            security: {
                ddosProtection: {
                    enabled: process.env.DDOS_PROTECTION_ENABLED !== 'false',
                    maxRequestsPerSecond: parseInt(process.env.MAX_REQUESTS_PER_SECOND) || 10,
                    suspiciousRequestThreshold: parseInt(process.env.SUSPICIOUS_THRESHOLD) || 50,
                    blockDuration: parseInt(process.env.BLOCK_DURATION) || 300000, // 5 minutes
                    whitelist: process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : [],
                    blacklist: process.env.IP_BLACKLIST ? process.env.IP_BLACKLIST.split(',') : []
                },
                inputValidation: {
                    maxPayloadSize: process.env.MAX_PAYLOAD_SIZE || '10mb',
                    allowedMethods: process.env.ALLOWED_METHODS ? process.env.ALLOWED_METHODS.split(',') : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                    allowedContentTypes: process.env.ALLOWED_CONTENT_TYPES ? process.env.ALLOWED_CONTENT_TYPES.split(',') : ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'],
                    sanitizeInputs: process.env.SANITIZE_INPUTS !== 'false'
                },
                cors: {
                    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
                    credentials: process.env.CORS_CREDENTIALS === 'true',
                    methods: process.env.CORS_METHODS ? process.env.CORS_METHODS.split(',') : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
                    allowedHeaders: process.env.CORS_ALLOWED_HEADERS ? process.env.CORS_ALLOWED_HEADERS.split(',') : ['Content-Type', 'Authorization', 'X-Requested-With']
                }
            },
            
            // Monitoring Configuration
            monitoring: {
                metricsInterval: parseInt(process.env.METRICS_INTERVAL) || 5000,
                logLevel: process.env.LOG_LEVEL || 'info',
                enableMetrics: process.env.ENABLE_METRICS !== 'false',
                enableTracing: process.env.ENABLE_TRACING === 'true',
                prometheus: {
                    enabled: process.env.PROMETHEUS_ENABLED !== 'false',
                    port: parseInt(process.env.PROMETHEUS_PORT) || 9090,
                    path: process.env.PROMETHEUS_PATH || '/metrics'
                },
                logging: {
                    format: process.env.LOG_FORMAT || 'json',
                    file: {
                        enabled: process.env.LOG_FILE_ENABLED !== 'false',
                        path: process.env.LOG_FILE_PATH || 'logs/',
                        maxSize: process.env.LOG_MAX_SIZE || '10m',
                        maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
                    }
                }
            },
            
            // Caching Configuration
            caching: {
                defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL) || 3600, // 1 hour
                maxCacheSize: parseInt(process.env.MAX_CACHE_SIZE) || 1000,
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT) || 6379,
                    password: process.env.REDIS_PASSWORD || null,
                    db: parseInt(process.env.CACHE_DB) || 1
                },
                headers: {
                    enabled: process.env.CACHE_HEADERS_ENABLED !== 'false',
                    vary: process.env.CACHE_HEADERS_VARY || 'Accept, Accept-Encoding',
                    cacheControl: process.env.CACHE_CONTROL || 'public, max-age=3600'
                }
            },
            
            // Adaptive Scaling Configuration
            scaling: {
                enabled: process.env.SCALING_ENABLED !== 'false',
                scalingInterval: parseInt(process.env.SCALING_INTERVAL) || 30000,
                cooldownPeriod: parseInt(process.env.COOLDOWN_PERIOD) || 300000,
                thresholds: {
                    cpu: {
                        scaleUp: parseInt(process.env.CPU_SCALE_UP) || 70,
                        scaleDown: parseInt(process.env.CPU_SCALE_DOWN) || 30
                    },
                    memory: {
                        scaleUp: parseInt(process.env.MEMORY_SCALE_UP) || 80,
                        scaleDown: parseInt(process.env.MEMORY_SCALE_DOWN) || 40
                    },
                    responseTime: {
                        scaleUp: parseInt(process.env.RESPONSE_TIME_SCALE_UP) || 1000,
                        scaleDown: parseInt(process.env.RESPONSE_TIME_SCALE_DOWN) || 200
                    },
                    requestRate: {
                        scaleUp: parseInt(process.env.REQUEST_RATE_SCALE_UP) || 1000,
                        scaleDown: parseInt(process.env.REQUEST_RATE_SCALE_DOWN) || 100
                    }
                }
            },
            
            // Health Check Configuration
            healthChecks: {
                checkInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
                timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
                retryAttempts: parseInt(process.env.HEALTH_CHECK_RETRIES) || 3,
                endpoints: {
                    basic: process.env.HEALTH_BASIC_PATH || '/health/basic',
                    detailed: process.env.HEALTH_DETAILED_PATH || '/health/detailed',
                    ready: process.env.HEALTH_READY_PATH || '/health/ready',
                    live: process.env.HEALTH_LIVE_PATH || '/health/live'
                }
            },
            
            // Analytics Configuration
            analytics: {
                analyticsInterval: parseInt(process.env.ANALYTICS_INTERVAL) || 60000,
                retentionPeriod: parseInt(process.env.ANALYTICS_RETENTION) || 7 * 24 * 60 * 60 * 1000, // 7 days
                alertChannels: {
                    webhook: process.env.ALERT_WEBHOOK_URL,
                    email: process.env.ALERT_EMAIL,
                    slack: process.env.SLACK_WEBHOOK_URL
                },
                thresholds: {
                    responseTime: parseInt(process.env.ANALYTICS_RESPONSE_TIME_THRESHOLD) || 2000,
                    errorRate: parseFloat(process.env.ANALYTICS_ERROR_RATE_THRESHOLD) || 5,
                    throughput: parseInt(process.env.ANALYTICS_THROUGHPUT_THRESHOLD) || 100,
                    availability: parseFloat(process.env.ANALYTICS_AVAILABILITY_THRESHOLD) || 99.9
                }
            },
            
            // Performance Configuration
            performance: {
                compression: {
                    enabled: process.env.COMPRESSION_ENABLED !== 'false',
                    threshold: parseInt(process.env.COMPRESSION_THRESHOLD) || 1024,
                    level: parseInt(process.env.COMPRESSION_LEVEL) || 6
                },
                bodyParser: {
                    json: {
                        limit: process.env.JSON_LIMIT || '10mb',
                        strict: process.env.JSON_STRICT !== 'false'
                    },
                    urlencoded: {
                        extended: process.env.URLENCODED_EXTENDED === 'true',
                        limit: process.env.URLENCODED_LIMIT || '10mb'
                    }
                }
            }
        };
    }

    /**
     * Load environment-specific configuration overrides
     */
    loadEnvironmentConfig() {
        const envConfigPath = path.join(__dirname, `../config/environments/${this.environment}.config.js`);
        
        if (fs.existsSync(envConfigPath)) {
            try {
                const envConfig = require(envConfigPath);
                this.config = this.deepMerge(this.config, envConfig);
            } catch (error) {
                console.warn(`Failed to load environment config for ${this.environment}:`, error.message);
            }
        }
    }

    /**
     * Load configuration from environment variables
     */
    loadFromEnv() {
        const envMappings = {
            'RATE_LIMIT_WINDOW_MS': 'rateLimiting.windowMs',
            'RATE_LIMIT_MAX_REQUESTS': 'rateLimiting.maxRequests',
            'LOAD_BALANCER_STRATEGY': 'loadBalancing.strategy',
            'MAX_CONNECTIONS': 'connectionPooling.database.max',
            'MAX_QUEUE_SIZE': 'requestQueue.maxQueueSize',
            'CACHE_DEFAULT_TTL': 'caching.defaultTTL',
            'LOG_LEVEL': 'monitoring.logLevel',
            'METRICS_INTERVAL': 'monitoring.metricsInterval'
        };

        for (const [envVar, configPath] of Object.entries(envMappings)) {
            const value = process.env[envVar];
            if (value !== undefined) {
                this.setConfigValue(configPath, this.parseValue(value));
            }
        }
    }

    /**
     * Validate configuration
     */
    validateConfig() {
        const requiredConfigs = [
            'rateLimiting.windowMs',
            'rateLimiting.maxRequests',
            'loadBalancing.strategy',
            'connectionPooling.database.max',
            'requestQueue.maxQueueSize'
        ];

        for (const configPath of requiredConfigs) {
            if (this.getConfigValue(configPath) === undefined) {
                throw new Error(`Missing required configuration: ${configPath}`);
            }
        }

        // Validate specific constraints
        if (this.getConfigValue('rateLimiting.maxRequests') <= 0) {
            throw new Error('rateLimiting.maxRequests must be greater than 0');
        }

        if (!['round-robin', 'weighted', 'least-connections', 'response-time'].includes(this.getConfigValue('loadBalancing.strategy'))) {
            throw new Error('loadBalancing.strategy must be one of: round-robin, weighted, least-connections, response-time');
        }

        const logLevel = this.getConfigValue('monitoring.logLevel');
        if (!['error', 'warn', 'info', 'debug'].includes(logLevel)) {
            throw new Error('monitoring.logLevel must be one of: error, warn, info, debug');
        }
    }

    /**
     * Get configuration value by path
     */
    getConfigValue(path) {
        return this.getValueByPath(this.config, path);
    }

    /**
     * Set configuration value by path
     */
    setConfigValue(path, value) {
        this.setValueByPath(this.config, path, value);
    }

    /**
     * Get full configuration
     */
    getConfig() {
        return this.config;
    }

    /**
     * Update configuration dynamically
     */
    updateConfig(updates) {
        this.config = this.deepMerge(this.config, updates);
        this.validateConfig();
    }

    /**
     * Reset to default configuration
     */
    resetConfig() {
        this.loadConfiguration();
    }

    /**
     * Save configuration to file
     */
    saveConfig(filePath = null) {
        const configPath = filePath || this.configPath;
        const configDir = path.dirname(configPath);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        const configContent = `/**
 * Traffic Handler Configuration
 * Generated on ${new Date().toISOString()}
 */

module.exports = ${JSON.stringify(this.config, null, 2)};`;

        fs.writeFileSync(configPath, configContent);
    }

    /**
     * Utility methods
     */
    getValueByPath(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    setValueByPath(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    parseValue(value) {
        // Try to parse as number
        if (!isNaN(value) && value.trim() !== '') {
            return parseFloat(value);
        }
        
        // Try to parse as boolean
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        
        // Return as string
        return value;
    }

    /**
     * Generate configuration template
     */
    static generateTemplate() {
        return `/**
 * Traffic Handler Configuration Template
 * Copy this file and customize for your environment
 */

module.exports = {
    // Rate Limiting Configuration
    rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        skipSuccessfulRequests: false,
        skipFailedRequests: false
    },
    
    // Load Balancing Configuration
    loadBalancing: {
        strategy: 'round-robin', // round-robin, weighted, least-connections, response-time
        backends: [
            {
                name: 'primary',
                url: 'http://localhost:5001',
                weight: 5,
                healthCheck: '/health',
                timeout: 5000
            }
        ]
    },
    
    // Connection Pooling Configuration
    connectionPooling: {
        database: {
            max: 100,
            min: 10,
            acquireTimeout: 60000
        },
        redis: {
            max: 50,
            min: 5,
            acquireTimeout: 30000
        }
    },
    
    // Request Queuing Configuration
    requestQueue: {
        maxQueueSize: 1000,
        queueTimeout: 30000,
        priorityLevels: 5
    },
    
    // Security Configuration
    security: {
        ddosProtection: {
            enabled: true,
            maxRequestsPerSecond: 10,
            blockDuration: 300000
        },
        inputValidation: {
            maxPayloadSize: '10mb',
            allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        }
    },
    
    // Monitoring Configuration
    monitoring: {
        metricsInterval: 5000,
        logLevel: 'info',
        enableMetrics: true,
        prometheus: {
            enabled: true,
            port: 9090,
            path: '/metrics'
        }
    },
    
    // Caching Configuration
    caching: {
        defaultTTL: 3600, // 1 hour
        maxCacheSize: 1000
    },
    
    // Adaptive Scaling Configuration
    scaling: {
        enabled: true,
        scalingInterval: 30000,
        cooldownPeriod: 300000,
        thresholds: {
            cpu: { scaleUp: 70, scaleDown: 30 },
            memory: { scaleUp: 80, scaleDown: 40 }
        }
    }
};`;
    }
}

module.exports = TrafficHandlerConfig;