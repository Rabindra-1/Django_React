#!/bin/bash

# Blog Platform - Django Backend Startup Script
echo "🚀 Starting Django Backend Server..."
echo "=================================="

# Navigate to the backend directory
cd "$(dirname "$0")/backend"

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Check for requirements updates
echo "📋 Checking requirements..."
pip install -r requirements.txt --quiet

# Apply any pending migrations
echo "🗃️  Applying database migrations..."
python manage.py migrate

# Start the Django development server
echo "🌐 Starting Django server on http://127.0.0.1:8000/"
echo "📡 API will be available at http://127.0.0.1:8000/api/"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

python manage.py runserver
