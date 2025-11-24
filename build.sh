#!/bin/bash

# Build script for Render deployment
echo "Starting build process..."

# Navigate to frontend directory and build
cd university-past-questions-frontend
echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Build completed successfully!"
ls -la dist/