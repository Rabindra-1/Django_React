# 🚀 Blog Platform - Server Startup Guide

## Quick Start (Recommended)

### Option 1: Using Startup Scripts
Open **two separate terminals** and run:

**Terminal 1 (Backend):**
```bash
cd /home/rawan/Documents/React_Django/blog_project
./start_backend.sh
```

**Terminal 2 (Frontend):**
```bash
cd /home/rawan/Documents/React_Django/blog_project
./start_frontend.sh
```

### Option 2: Manual Commands

**Terminal 1 - Django Backend:**
```bash
cd /home/rawan/Documents/React_Django/blog_project/backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 - React Frontend:**
```bash
cd /home/rawan/Documents/React_Django/blog_project/frontend
npm start
```

## 🌐 Access Your Application

Once both servers are running:

- **Frontend (React App)**: http://localhost:3000
- **Backend (Django API)**: http://127.0.0.1:8000
- **Django Admin**: http://127.0.0.1:8000/admin
- **API Endpoints**: http://127.0.0.1:8000/api/

## 📱 What You'll See

The Blog Platform will open in your browser with:
- ✅ **Home Page** with sample blog posts
- ✅ **Write Page** to create new blog posts  
- ✅ **Generate Page** with AI tools (Text, Image, Video, YouTube)
- ✅ **Dark/Light Mode** toggle
- ✅ **Responsive Design** that works on all devices

## 🔧 Troubleshooting

### Backend Issues:
```bash
# If virtual environment issues:
cd /home/rawan/Documents/React_Django/blog_project/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# If database issues:
python manage.py migrate
python manage.py makemigrations
python manage.py migrate
```

### Frontend Issues:
```bash
# If dependency issues:
cd /home/rawan/Documents/React_Django/blog_project/frontend
rm -rf node_modules package-lock.json
npm install

# If port is busy:
kill -9 $(lsof -ti:3000)
npm start
```

## 🎯 Development Workflow

1. **Start both servers** using the scripts above
2. **Frontend** will automatically reload when you make changes
3. **Backend** will restart when you modify Python files
4. **Database changes** require running migrations
5. **New dependencies** require restarting servers

## 📊 Server Status

### ✅ Backend is Running When:
- Terminal shows: `Starting development server at http://127.0.0.1:8000/`
- You can access: http://127.0.0.1:8000
- No error messages in terminal

### ✅ Frontend is Running When:
- Terminal shows: `webpack compiled with 0 errors`
- Browser automatically opens to: http://localhost:3000
- You see the BlogHub interface

## 🛑 Stopping Servers

In each terminal window, press: **Ctrl + C**

## 🎨 Features Available

With both servers running, you'll have access to:

### 📝 Blog Features:
- Create, edit, and view blog posts
- Category organization
- Like and comment system
- Responsive design

### 🤖 AI Features:
- Text generation
- Image generation  
- Video creation
- YouTube link processing

### 👤 User Features:
- User authentication
- Profile management
- Theme preferences

### 🔧 Developer Features:
- Hot reload for both frontend and backend
- API integration with fallback to sample data
- TypeScript support
- Error handling and loading states

---

**Happy coding! 🎉**

Your Blog Platform is now ready for development and testing!
