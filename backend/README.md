# Production-Ready Traffic Handler Middleware

A comprehensive, production-grade traffic management system for Node.js applications featuring intelligent load balancing, adaptive scaling, circuit breakers, request queuing, real-time monitoring, and advanced security features.

## 🚀 Features

### Core Traffic Management
- **Intelligent Load Balancing**: Round-robin, weighted, least-connections, and response-time strategies
- **Request Queuing**: Priority-based queuing with configurable timeouts
- **Connection Pooling**: Database, Redis, and HTTP connection pool management
- **Circuit Breakers**: Prevent cascade failures with configurable thresholds
- **Rate Limiting**: Per-IP and per-user rate limiting with sliding windows

### Security & Protection
- **DDoS Protection**: Suspicious request pattern detection and blocking
- **Input Validation**: Request sanitization and validation
- **Security Headers**: Helmet integration with CSP policies
- **CORS Configuration**: Configurable cross-origin resource sharing
- **IP Blacklisting/Whitelisting**: Traffic filtering capabilities

### Monitoring & Analytics
- **Real-time Metrics**: Prometheus-compatible metrics collection
- **Performance Analytics**: Response time, throughput, and error rate analysis
- **Health Checks**: Multiple health check endpoints for service discovery
- **Alerting System**: Configurable alerts with multiple notification channels
- **Traffic Dashboard**: Comprehensive traffic management interface

### Adaptive Scaling
- **Auto-scaling**: Automatic resource scaling based on traffic patterns
- **Predictive Scaling**: Traffic pattern analysis and forecasting
- **Manual Control**: API endpoints for manual scaling operations
- **Cost Optimization**: Intelligent scaling to minimize costs

### Caching & Performance
- **Cache Headers**: Automatic cache control headers
- **Cache-busting**: ETag and versioning support
- **Compression**: Response compression for performance
- **Graceful Degradation**: Automatic degradation under high load

## 📋 Requirements

- Node.js 16+ (18+ recommended)
- MongoDB (for application data)
- Redis (optional, for distributed features)
- npm or yarn

## 🛠 Installation

1. **Clone and Install Dependencies**:
```bash
cd backend
npm install
```

2. **Environment Configuration**:
```bash
cp .env.example .env
```

3. **Configure Environment Variables** (see [Configuration](#-configuration))

4. **Start the Server**:
```bash
# Development
npm run dev

# Production
npm start
```

## ⚙️ Configuration

### Environment Variables

#### Core Configuration
```env
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/university-past-questions

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

#### Rate Limiting
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DDOS_PROTECTION_ENABLED=true
MAX_REQUESTS_PER_SECOND=10
SUSPICIOUS_THRESHOLD=50
BLOCK_DURATION=300000
```

#### Load Balancing
```env
LOAD_BALANCER_STRATEGY=round-robin
HEALTH_CHECK_INTERVAL=30000
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000

# Backend services
PRIMARY_BACKEND_URL=http://localhost:5001
SECONDARY_BACKEND_URL=http://localhost:5002
PRIMARY_WEIGHT=5
SECONDARY_WEIGHT=3
```

#### Connection Pooling
```env
# Database connections
DB_MAX_CONNECTIONS=100
DB_MIN_CONNECTIONS=10
DB_ACQUIRE_TIMEOUT=60000

# Redis connections
REDIS_MAX_CONNECTIONS=50
REDIS_MIN_CONNECTIONS=5
REDIS_ACQUIRE_TIMEOUT=30000

# HTTP connections
HTTP_MAX_SOCKETS=50
HTTP_KEEP_ALIVE=true
```

#### Request Queueing
```env
MAX_QUEUE_SIZE=1000
QUEUE_TIMEOUT=30000
PRIORITY_LEVELS=5
```

#### Monitoring & Analytics
```env
METRICS_INTERVAL=5000
LOG_LEVEL=info
ENABLE_METRICS=true
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090

# Alerting
ALERT_WEBHOOK_URL=
ALERT_EMAIL=
SLACK_WEBHOOK_URL=
```

#### Security
```env
IP_WHITELIST=127.0.0.1,::1
IP_BLACKLIST=
ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH
MAX_PAYLOAD_SIZE=10mb
CORS_ORIGIN=http://localhost:5173
```

#### Caching
```env
CACHE_DEFAULT_TTL=3600
MAX_CACHE_SIZE=1000
CACHE_HEADERS_ENABLED=true
```

#### Adaptive Scaling
```env
SCALING_ENABLED=true
SCALING_INTERVAL=30000
COOLDOWN_PERIOD=300000
CPU_SCALE_UP=70
CPU_SCALE_DOWN=30
MEMORY_SCALE_UP=80
MEMORY_SCALE_DOWN=40
```

### Configuration File

Create `backend/config/environments/development.config.js`:

```javascript
module.exports = {
    rateLimiting: {
        maxRequests: 200, // Higher limits for development
        windowMs: 5 * 60 * 1000 // 5 minutes
    },
    monitoring: {
        logLevel: 'debug',
        enableTracing: true
    },
    security: {
        ddosProtection: {
            enabled: false // Disabled for development
        }
    }
};
```

## 📡 API Endpoints

### Core Application Endpoints

#### Health & Information
```
GET /                      # Basic health check
GET /api                   # API information
GET /api/system/info       # System information
```

#### Authentication
```
POST /api/auth/login       # User login
POST /api/auth/register    # User registration
GET  /api/auth/me          # Get user profile
```

#### Business Logic
```
GET    /api/past-questions      # Get all past questions
GET    /api/past-questions/:id  # Get specific question
POST   /api/past-questions      # Create new question
PUT    /api/past-questions/:id  # Update question
DELETE /api/past-questions/:id  # Delete question

GET    /api/courses             # Get all courses
GET    /api/courses/:id         # Get specific course

GET    /api/videos/search       # Search videos
```

### Traffic Handler Endpoints

#### Monitoring Dashboard
```
GET /api/monitoring/dashboard          # Real-time dashboard data
GET /api/monitoring/metrics/realtime   # Real-time metrics
GET /api/monitoring/metrics/historical # Historical metrics
GET /api/monitoring/health             # Health check details
GET /api/monitoring/alerts             # Active alerts
```

#### Traffic Management
```
GET  /api/traffic/dashboard            # Traffic control dashboard
POST /api/traffic/scale/up             # Manual scale up
POST /api/traffic/scale/down           # Manual scale down
POST /api/traffic/reset/rate-limit     # Reset rate limits
```

#### Analytics
```
GET /api/analytics/performance/overview     # Performance overview
GET /api/analytics/performance/bottlenecks  # Bottleneck analysis
GET /api/analytics/users/behavior           # User behavior analytics
GET /api/analytics/capacity/planning        # Capacity planning
GET /api/analytics/cost/analysis            # Cost analysis
GET /api/analytics/alerts/history           # Alert history
GET /api/analytics/predictive/traffic       # Traffic forecasting
GET /api/analytics/health/score             # System health score
GET /api/analytics/compliance/report        # Compliance report
```

#### Health Checks
```
GET /api/health/basic     # Basic health check
GET /api/health/detailed  # Detailed health check
GET /api/health/ready     # Readiness probe
GET /api/health/live      # Liveness probe
```

#### Cache Management
```
POST /api/cache/clear     # Clear cache
GET  /api/cache/stats     # Cache statistics
```

#### Prometheus Metrics
```
GET /api/monitoring/metrics/prometheus     # Prometheus metrics
```

## 🏥 Health Checks

### Basic Health Check
```bash
curl http://localhost:5001/api/health/basic
```

Response:
```json
{
    "status": "ok",
    "timestamp": "2023-11-16T21:38:35.116Z",
    "uptime": 3600,
    "version": "1.0.0"
}
```

### Detailed Health Check
```bash
curl http://localhost:5001/api/health/detailed
```

Response:
```json
{
    "status": "healthy",
    "timestamp": "2023-11-16T21:38:35.116Z",
    "uptime": 3600,
    "checks": {
        "application": {
            "status": "healthy",
            "message": "Application is running",
            "responseTime": 5
        },
        "database": {
            "status": "healthy",
            "message": "Database connection healthy",
            "responseTime": 15
        }
    },
    "metrics": {
        "memory": {
            "used": 45,
            "total": 128,
            "percentage": 35
        }
    }
}
```

## 📊 Monitoring

### Traffic Dashboard
Access the comprehensive traffic dashboard at:
```
http://localhost:5001/api/traffic/dashboard
```

Features:
- Real-time request metrics
- Circuit breaker status
- Load balancer performance
- Connection pool statistics
- Security events
- Scaling recommendations

### Prometheus Metrics
Prometheus-compatible metrics are available at:
```
http://localhost:5001/api/monitoring/metrics/prometheus
```

Key metrics:
- `http_requests_total`: Total HTTP requests
- `http_request_duration_seconds`: Request duration histogram
- `circuit_breaker_state`: Circuit breaker state gauge
- `rate_limit_hits_total`: Rate limit hits counter
- `cache_hits_total` / `cache_misses_total`: Cache performance

### Alert Configuration

Configure alerts via environment variables:

```env
# Webhook alerts
ALERT_WEBHOOK_URL=https://your-webhook-endpoint.com/alerts

# Email alerts (requires SMTP configuration)
ALERT_EMAIL=alerts@yourcompany.com

# Slack alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## 🔒 Security Features

### Rate Limiting
- **Per-IP**: Limits requests based on client IP
- **Per-User**: Limits requests based on authenticated user
- **Sliding Window**: Uses sliding time window for fair limiting
- **Configurable**: Customize limits per environment

### DDoS Protection
- **Suspicious Pattern Detection**: Identifies malicious request patterns
- **Automatic Blocking**: Temporarily blocks suspicious IPs
- **Whitelist/Blacklist**: Manual IP filtering
- **Request Analysis**: Analyzes headers, user agents, and payload sizes

### Input Validation
- **Method Validation**: Restricts allowed HTTP methods
- **Content-Type Validation**: Validates request content types
- **Payload Size Limits**: Prevents oversized requests
- **Parameter Sanitization**: Sanitizes query parameters

### Security Headers
Automatic security headers via Helmet:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security (HTTPS)

## ⚡ Performance Features

### Connection Pooling
- **Database Pool**: MongoDB connection pooling
- **Redis Pool**: Redis connection pooling
- **HTTP Pool**: HTTP client connection pooling
- **Auto-scaling**: Pools scale based on demand

### Request Queuing
- **Priority Queues**: 5 priority levels for different request types
- **Timeout Handling**: Automatic timeout for queued requests
- **Queue Monitoring**: Real-time queue size monitoring
- **Graceful Degradation**: Queues requests under high load

### Caching
- **Cache Headers**: Automatic cache control headers
- **ETag Support**: Entity tag caching
- **Cache-busting**: Automatic cache invalidation
- **Configurable TTL**: Customizable cache expiration

### Compression
- **Gzip Compression**: Automatic response compression
- **Threshold**: Compresses responses above size threshold
- **Configurable Level**: Adjustable compression level

## 🔄 Load Balancing

### Strategies
1. **Round-Robin**: Equal distribution across backends
2. **Weighted**: Distribution based on server weights
3. **Least Connections**: Routes to server with fewest active connections
4. **Response Time**: Routes to fastest responding server

### Circuit Breakers
- **Failure Threshold**: Configurable failure threshold
- **Timeout Period**: Automatic recovery timeout
- **State Monitoring**: Real-time circuit breaker state tracking
- **Fallback Handling**: Graceful fallback when circuit is open

### Health Checks
- **Periodic Checks**: Regular backend health monitoring
- **Automatic Removal**: Removes unhealthy backends from rotation
- **Recovery Detection**: Automatically adds recovered backends

## 🚀 Adaptive Scaling

### Auto-scaling Triggers
- **CPU Usage**: Scale based on CPU utilization
- **Memory Usage**: Scale based on memory consumption
- **Response Time**: Scale based on response times
- **Request Rate**: Scale based on incoming request rate
- **Queue Depth**: Scale based on request queue size

### Scaling Actions
- **Connection Pool Scaling**: Adjust pool sizes
- **Queue Capacity**: Modify queue capacity limits
- **Rate Limiting**: Adjust rate limiting thresholds
- **Caching**: Modify cache TTL and size
- **Backend Management**: Enable/disable backend instances

### Predictive Scaling
- **Traffic Patterns**: Analyzes historical traffic patterns
- **Demand Forecasting**: Predicts future resource needs
- **Proactive Scaling**: Scales before capacity is reached
- **Cost Optimization**: Balances performance and cost

## 🔧 Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Check memory usage
curl http://localhost:5001/api/system/info

# Monitor garbage collection
node --inspect server.js
```

#### Circuit Breakers Tripping
```bash
# Check circuit breaker status
curl http://localhost:5001/api/traffic/dashboard

# Reset circuit breakers (if needed)
# Restart the service
```

#### Rate Limiting Issues
```bash
# Check rate limit statistics
curl http://localhost:5001/api/cache/stats

# Reset rate limits
curl -X POST http://localhost:5001/api/traffic/reset/rate-limit \
  -H "Content-Type: application/json" \
  -d '{"ip":"192.168.1.1"}'
```

#### Database Connection Issues
```bash
# Check database health
curl http://localhost:5001/api/health/detailed

# Monitor connection pool
curl http://localhost:5001/api/traffic/dashboard
```

### Logs
Application logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (error logs only)

Log levels: `error`, `warn`, `info`, `debug`

### Debug Mode
Enable debug logging:
```env
LOG_LEVEL=debug
ENABLE_TRACING=true
```

## 📈 Performance Tuning

### Production Recommendations

#### Memory Tuning
```env
# Increase Node.js heap size
node --max-old-space-size=4096 server.js

# Optimize garbage collection
node --optimize-for-size server.js
```

#### Database Tuning
```env
# Increase connection pool size
DB_MAX_CONNECTIONS=200
DB_MIN_CONNECTIONS=20

# Optimize connection timeouts
DB_ACQUIRE_TIMEOUT=30000
DB_IDLE_TIMEOUT=60000
```

#### Cache Tuning
```env
# Increase cache size
MAX_CACHE_SIZE=5000

# Optimize cache TTL
CACHE_DEFAULT_TTL=7200
```

#### Security Tuning
```env
# Tighten rate limits
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=300000

# Enable DDoS protection
DDOS_PROTECTION_ENABLED=true
MAX_REQUESTS_PER_SECOND=5
```

## 🚀 Deployment

### Docker Deployment

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5001

CMD ["npm", "start"]
```

2. **Build and Run**:
```bash
docker build -t university-past-questions-api .
docker run -p 5001:5001 --env-file .env university-past-questions-api
```

### Kubernetes Deployment

1. **Create Deployment**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: university-past-questions-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: university-past-questions-api
  template:
    metadata:
      labels:
        app: university-past-questions-api
    spec:
      containers:
      - name: api
        image: university-past-questions-api:latest
        ports:
        - containerPort: 5001
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5001"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health/live
            port: 5001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 5001
          initialDelaySeconds: 5
          periodSeconds: 5
```

2. **Create Service**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: university-past-questions-api-service
spec:
  selector:
    app: university-past-questions-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5001
  type: LoadBalancer
```

### Load Balancer Configuration

#### Nginx Configuration
```nginx
upstream api_backend {
    server localhost:5001;
    server localhost:5002;
    server localhost:5003;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔍 Testing

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:5001'
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "API Load Test"
    weight: 100
    flow:
      - get:
          url: "/api/past-questions"
      - think: 1
EOF

# Run load test
artillery run load-test.yml
```

### Performance Testing
```bash
# Install autocannon
npm install -g autocannon

# Run performance test
autocannon -c 100 -d 60 http://localhost:5001/api/past-questions
```

## 📚 Additional Resources

### Documentation Files
- [Configuration Guide](CONFIGURATION.md)
- [API Documentation](API.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

### External Resources
- [Express.js Documentation](https://expressjs.com/)
- [Prometheus Metrics](https://prometheus.io/docs/concepts/metric_types/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Rate Limiting Algorithms](https://en.wikipedia.org/wiki/Rate_limiting)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting guide
- Review the API documentation

---

**Built with ❤️ for production-ready Node.js applications**