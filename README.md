# Full-Stack Blog Application

A comprehensive blog application built with Django REST Framework backend and React TypeScript frontend.

## Features

### Backend (Django + Django REST Framework)

✅ **Implemented:**
- User Authentication (JWT-based)
- Blog CRUD operations with different layouts
- Comment system with nested/threaded comments
- Like and bookmark functionality
- Tag system
- Media upload support
- Search and filtering
- AI-powered blog generation (OpenAI integration)
- Video-to-blog transcription (Whisper API)
- Admin interface

✅ **Models:**
- User profiles with extended information
- Blogs with title, content, images, layouts, tags
- Comments with threading support
- Likes and bookmarks
- Tags

✅ **API Endpoints:**
- `/api/auth/` - Authentication endpoints
- `/api/blogs/` - Blog CRUD, like, bookmark
- `/api/comments/` - Comment CRUD with threading
- `/api/blogs/generate/` - AI content generation
- `/api/blogs/generate-from-video/` - Video transcription

### Frontend (React + TypeScript)

✅ **Implemented:**
- React 19 with TypeScript
- Material-UI for components
- TanStack Query for data fetching
- React Router for navigation
- Context API for state management (Auth, Theme)
- Dark/Light mode toggle
- Responsive design

✅ **Pages:**
- Home page with blog feed and filtering
- Login/Register pages
- Write blog page with rich text editor
- AI blog generation page
- User profile and dashboard (stubs)
- Protected routes

## Tech Stack

### Backend
- **Django 5.2.4** - Web framework
- **Django REST Framework** - API framework
- **djangorestframework-simplejwt** - JWT authentication
- **django-cors-headers** - CORS handling
- **django-filter** - API filtering
- **Pillow** - Image processing
- **OpenAI** - AI content generation
- **Whisper** - Speech-to-text
- **SQLite** - Database (development)

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **TanStack Query** - Data fetching
- **React Router** - Routing
- **React Hook Form** - Form handling
- **React Quill** - Rich text editor
- **Axios** - HTTP client

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables in `.env`:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
OPENAI_API_KEY=your-openai-api-key-here
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Start development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Documentation

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get user profile
- `PUT/PATCH /api/auth/profile/update/` - Update profile

### Blogs
- `GET /api/blogs/` - List blogs (with search/filter)
- `POST /api/blogs/` - Create blog
- `GET /api/blogs/{slug}/` - Get blog detail
- `PUT/PATCH /api/blogs/{slug}/` - Update blog
- `DELETE /api/blogs/{slug}/` - Delete blog
- `POST /api/blogs/{id}/like/` - Toggle like
- `POST /api/blogs/{id}/bookmark/` - Toggle bookmark
- `GET /api/blogs/my-blogs/` - Get user's blogs
- `GET /api/blogs/bookmarked/` - Get bookmarked blogs
- `POST /api/blogs/generate/` - Generate content with AI
- `POST /api/blogs/generate-from-video/` - Generate from video

### Comments
- `GET /api/comments/blog/{blog_id}/` - List comments for blog
- `POST /api/comments/blog/{blog_id}/` - Create comment
- `POST /api/comments/{comment_id}/reply/` - Reply to comment

## Features Overview

### Blog Management
- Create blogs with rich text editor
- Support for different layouts (minimal, image-left, image-right, gallery)
- Image upload for featured images
- Tag system for categorization
- Draft and published states

### AI Integration
- Generate blog content from prompts using OpenAI
- Convert video/audio to blog posts using Whisper
- Content suggestions and improvements

### User Interaction
- Like and bookmark blogs
- Comment system with nested replies
- User profiles with bio and avatar
- Personal dashboard

### Search & Discovery
- Full-text search across blogs
- Filter by tags, author, date
- Sort by popularity, date, likes

## Development Status

### Completed ✅
- Backend API with all core functionality
- Frontend architecture and core components
- Authentication system
- Blog CRUD operations
- Basic UI components and pages

### In Progress 🚧
- Complete frontend implementation of all features
- Video upload and processing
- Advanced comment features
- User dashboard functionality

### TODO 📝
- Complete all frontend pages
- Implement real-time features (WebSocket)
- Add notifications system
- Implement blog categories
- Add social sharing
- Mobile app (React Native)
- Deploy to production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
