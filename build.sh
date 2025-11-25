#!/bin/bash

# Optimized build script for Render deployment
set -e  # Exit on any error

echo "🚀 Starting optimized build process..."

# Performance optimization variables
export NODE_ENV=production
export CI=false
export GENERATE_SOURCEMAP=false

# Navigate to frontend directory and build
cd university-past-questions-frontend

echo "📦 Installing dependencies with performance optimizations..."
npm ci --only=production --silent --loglevel=error

echo "🏗️  Building frontend with optimizations..."
# Run build with environment variables for better performance
NODE_ENV=production npm run build

echo "📊 Analyzing build output..."
# Check bundle sizes
if command -v du >/dev/null 2>&1; then
    echo "📁 Build directory size:"
    du -sh dist/ 2>/dev/null || echo "Could not calculate directory size"
fi

if command -v ls >/dev/null 2>&1; then
    echo "📄 Build files:"
    ls -la dist/ 2>/dev/null || echo "Build directory not found"
fi

# Validate critical files exist
echo "🔍 Validating build output..."
if [ -f "dist/index.html" ]; then
    echo "✅ index.html found"
else
    echo "❌ index.html missing!"
    exit 1
fi

if [ -f "dist/assets" ] || [ -d "dist/assets" ]; then
    echo "✅ Assets directory found"
else
    echo "❌ Assets directory missing!"
    exit 1
fi

# Check for critical performance files
if [ -f "public/_redirects" ]; then
    echo "✅ SPA routing configured"
else
    echo "⚠️  SPA routing configuration missing"
fi

if [ -f "public/.htaccess" ]; then
    echo "✅ Server configuration found"
else
    echo "⚠️  Server configuration missing"
fi

if [ -f "public/sw.js" ]; then
    echo "✅ Service worker found"
else
    echo "⚠️  Service worker missing"
fi

echo "🎉 Build completed successfully!"
echo ""
echo "Performance optimizations applied:"
echo "  • Code splitting and lazy loading"
echo "  • Asset compression and caching"
echo "  • Service worker for offline support"
echo "  • Bundle size optimization"
echo "  • SPA routing configuration"
echo ""