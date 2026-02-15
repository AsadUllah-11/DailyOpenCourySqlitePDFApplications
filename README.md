# DailyOpenCourt - Setup and Installation Guide

A comprehensive court management system built with Django (backend) and React (frontend).

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** and **npm** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL** (Optional but recommended for production)
- **Git** - [Download Git](https://git-scm.com/downloads/)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/AsadUllah-11/DailyOpenCourt-WithoutPush.git
cd DailyOpenCourt-WithoutPush
```

---

## 🔧 Backend Setup (Django)

### 2. Navigate to Backend Directory

```bash
cd backend
```

### 3. Create Python Virtual Environment

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` prefix in your terminal indicating the virtual environment is active.

### 4. Install Backend Dependencies

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers openpyxl pillow python-dotenv django-filter psycopg2-binary
```

**Key Dependencies:**
- `django` - Web framework
- `djangorestframework` - REST API framework
- `djangorestframework-simplejwt` - JWT authentication
- `django-cors-headers` - CORS support for frontend communication
- `django-filter` - API filtering support
- `openpyxl` - Excel file processing
- `pillow` - Image/file handling
- `python-dotenv` - Environment variable management
- `psycopg2-binary` - PostgreSQL database adapter

### 5. Configure Environment Variables

Create a `.env` file in the `backend` directory:

**For SQLite (Development):**
```env
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
```

**For PostgreSQL (Production):**
```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
```

### 6. Apply Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

This creates all necessary database tables.

### 7. Create Superuser (Admin Account)

```bash
python manage.py createsuperuser
```

Follow the prompts to set:
- **Username** (e.g., admin)
- **Email** (optional, can press Enter to skip)
- **Password** (enter a secure password)

### 8. Create Media Directories

These directories are required for file uploads:

**On Windows:**
```bash
mkdir media\video_feedback media\video_responses media\documents
```

**On macOS/Linux:**
```bash
mkdir -p media/video_feedback media/video_responses media/documents
```

### 9. Run Backend Development Server

```bash
python manage.py runserver
```

✅ **Backend is now running at:** `http://localhost:8000`

**Verify backend is working:**
- Admin panel: `http://localhost:8000/admin`
- API endpoint: `http://localhost:8000/api/`

**Login to admin panel** using the superuser credentials you created in Step 7.

---

## 🎨 Frontend Setup (React)

### 10. Open New Terminal and Navigate to Frontend Directory

**Important:** Keep the backend server running in the previous terminal!

Open a **new terminal window/tab** and run:

```bash
cd DailyOpenCourt-WithoutPush/frontend
```

### 11. Install Frontend Dependencies

```bash
npm install
```

This will install all required packages including:
- `react` & `react-dom` - Core React libraries
- `react-router-dom` - Routing
- `axios` - HTTP client for API calls
- `@tanstack/react-query` - Data fetching and caching
- `recharts` - Charts and data visualization
- `lucide-react` & `react-icons` - Icons
- `xlsx` - Excel file handling

### 12. Start Frontend Development Server

```bash
npm start
```

✅ **Frontend will automatically open at:** `http://localhost:3000`

If it doesn't open automatically, manually navigate to `http://localhost:3000` in your browser.

---

## 🎯 Accessing the Application

### Login to the Application

1. Open your browser and go to `http://localhost:3000`
2. Use the superuser credentials you created in Step 7:
   - **Username:** (your superuser username)
   - **Password:** (your superuser password)

### Creating Additional Users

1. Go to the admin panel: `http://localhost:8000/admin`
2. Log in with your superuser account
3. Navigate to **Users** section
4. Click **Add User** to create new accounts

---

## 📊 Loading Sample Data (Optional)

### Load Excel Data:

If you have an Excel file with application data:

1. Place your Excel file in the `backend/` directory
2. Edit `backend/load_excel_data.py` and update the file path at the bottom
3. Activate virtual environment and run:
```bash
python load_excel_data.py
```

### Load Video Feedback:

If you have video files for feedback:

1. Create a folder with video files in the `backend/` directory
2. Edit `backend/load_videos.py` and update the folder path at the bottom
3. Run:
```bash
python load_videos.py
```

---

## 📁 Project Structure

```
DailyOpenCourt-WithoutPush/
│
├── backend/                    # Django Backend
│   ├── backend/               # Django project settings
│   │   ├── settings.py       # Main settings
│   │   ├── urls.py           # URL routing
│   │   └── wsgi.py           # WSGI config
│   ├── core/                 # Main Django app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API views
│   │   ├── serializers.py    # DRF serializers
│   │   ├── urls.py           # App URLs
│   │   └── admin.py          # Admin configuration
│   ├── media/                # Uploaded files
│   │   ├── video_feedback/
│   │   ├── video_responses/
│   │   └── documents/
│   ├── manage.py             # Django management script
│   ├── load_excel_data.py    # Excel data loader
│   └── load_videos.py        # Video feedback loader
│
└── frontend/                  # React Frontend
    ├── public/               # Static files
    ├── src/                  # React source code
    │   ├── components/       # React components
    │   ├── pages/            # Page components
    │   ├── services/         # API services
    │   └── App.js            # Main app component
    ├── package.json          # NPM dependencies
    └── README.md             # React documentation
```

---

## 🛠️ Common Commands

### Backend Commands:

```bash
# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# Run development server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Access Django shell
python manage.py shell

# Collect static files (for production)
python manage.py collectstatic
```

### Frontend Commands:

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Install new package
npm install <package-name>
```

---

## ⚙️ API Configuration

### Backend API Base URL:

The frontend connects to the backend at `http://localhost:8000/api/`

If you need to change this, update the base URL in:
- `frontend/src/services/api.js`

### CORS Configuration:

The backend is configured to accept requests from:
- `http://localhost:3000`

To add additional origins, edit `backend/backend/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://yourdomain.com',  # Add your domain
]
```

---

## 🔧 Troubleshooting

### Port Already in Use

**Backend (Port 8000):**
```bash
# Find and kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

**Frontend (Port 3000):**
```bash
# Find and kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Virtual Environment Not Activating

Make sure you're in the `backend` directory and the `venv` folder exists. If not, recreate it:
```bash
python -m venv venv
```

### Database Errors

If you encounter database errors, try:
```bash
# Delete database and migrations
rm db.sqlite3
rm -rf core/migrations

# Recreate migrations
python manage.py makemigrations core
python manage.py migrate
python manage.py createsuperuser
```

### Frontend Module Not Found

If npm packages are missing:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Ensure:
1. Backend is running on `http://localhost:8000`
2. Frontend is running on `http://localhost:3000`
3. `CORS_ALLOWED_ORIGINS` in `settings.py` includes `http://localhost:3000`

---

## 🚀 Production Deployment

### Backend:

1. Set `DEBUG = False` in `backend/backend/settings.py`
2. Configure `ALLOWED_HOSTS`:
```python
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
```
3. Set up PostgreSQL database (recommended)
4. Use gunicorn or uWSGI as WSGI server:
```bash
pip install gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```
5. Configure static/media file serving with Nginx or Apache
6. Set up proper environment variables for production

### Frontend:

1. Update API base URL in `frontend/src/services/api.js` to your production backend URL
2. Build the production version:
```bash
npm run build
```
3. Serve the `build/` directory using Nginx, Apache, or a static hosting service
4. Configure environment variables for production API endpoints

---

## 📞 Support

For issues or questions:
- Check the [GitHub repository](https://github.com/AsadUllah-11/DailyOpenCourt-WithoutPush)
- Review error messages in browser console (F12) and terminal
- Ensure all dependencies are properly installed
- Verify both backend and frontend servers are running

---

## ✅ Quick Start Checklist

- [ ] Clone repository
- [ ] Install Python 3.8+ and Node.js 16+
- [ ] Navigate to `backend/` directory
- [ ] Create and activate Python virtual environment
- [ ] Install backend dependencies
- [ ] Create `.env` file with database configuration
- [ ] Run database migrations
- [ ] Create superuser account
- [ ] Create media directories
- [ ] Start backend server at `http://localhost:8000`
- [ ] Open new terminal and navigate to `frontend/` directory
- [ ] Install frontend dependencies with `npm install`
- [ ] Start frontend server at `http://localhost:3000`
- [ ] Log in with superuser credentials
- [ ] Create additional users via admin panel (if needed)

---

**Happy Coding! 🎉**