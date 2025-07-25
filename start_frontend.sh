#!/bin/bash

# Blog Platform - React Frontend Startup Script
echo "⚛️  Starting React Frontend Server..."
echo "====================================="

# Navigate to the frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
else
    echo "📦 Node.js dependencies found"
fi

# Start the React development server
echo "🌐 Starting React server on http://localhost:3000/"
echo "🎨 Blog Platform will be available in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo "====================================="

npm start
