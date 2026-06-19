
# 🏫 Heavenly Nature School Management System

> **"Nurturing Right Leaders"**

A comprehensive, full-stack school management system built for **Heavenly Nature Nursery & Primary School** in Juba, South Sudan. This system manages students, teachers, classes, attendance, examinations, finances, and reports.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Python](https://img.shields.io/badge/python-3.12+-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-teal)
![React](https://img.shields.io/badge/React-18.3+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Deployment](#-deployment)
  - [Backend (Render)](#backend-render)
  - [Frontend (Vercel)](#frontend-vercel)
  - [Database (MongoDB Atlas)](#database-mongodb-atlas)
- [API Documentation](#-api-documentation)
- [Features by Module](#-features-by-module)
- [Default Login](#-default-login)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## ✨ Features

### 🎓 Student Management
- Student enrollment with guardian information
- Student profiles with academic history
- Class assignment and promotion
- Bulk student import (CSV)
- Student type classification (street, abundant, orphan, other)
- Document management

### 👨‍🏫 Teacher Management
- Teacher registration with qualifications
- Subject assignment
- Class teacher assignment
- Performance reviews
- Training history
- Leave management
- Workload monitoring

### 🏫 Class Management
- Class creation and management
- Classroom assignment
- Weekly schedule/timetable
- Student capacity tracking
- Promotion management
- Class statistics

### 📋 Attendance
- Daily attendance marking
- Bulk attendance entry
- Attendance reports
- Chronic absenteeism alerts
- Attendance analytics
- Heatmap visualization

### 📝 Examinations
- Exam creation and scheduling
- Result entry with auto-grading
- Grade distribution analysis
- Report card generation
- Class rankings
- Academic analytics
- Subject performance trends

### 💰 Financial Management
- Income and expense tracking
- Fee structure management
- Payment recording with receipts
- Budget planning and monitoring
- Financial reports
- Fee collection analytics
- Cash flow projections

### 📊 Reports
- Academic performance reports
- Attendance reports
- Financial reports
- Enrollment reports
- Staff reports
- Annual comprehensive reports
- CSV/PDF export

### 🏛️ School Management
- School information management
- Academic calendar
- Event management
- Board of directors
- Network memberships
- Strategic planning
- System settings

### 🔐 Security
- JWT authentication
- Role-based access control (RBAC)
- Permission management
- Account lockout protection
- Password expiry policies
- Audit logging
- Rate limiting

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide React |
| **Backend** | Python 3.12+, FastAPI, Motor (MongoDB async driver) |
| **Database** | MongoDB Atlas (Cloud) |
| **Authentication** | JWT (JSON Web Tokens), bcrypt |
| **Storage** | Cloudflare R2 |
| **Email** | Brevo (Sendinblue) API |
| **Deployment** | Render (Backend), Vercel (Frontend) |

---

## 📁 Project Structure


## 📁 Project Structure

```
heavenlynatureschools_db/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/            # API Routes (10 modules)
│   │   ├── core/              # Config, Security, Database
│   │   ├── models/            # MongoDB Models (8 modules)
│   │   ├── schemas/           # Pydantic Schemas (9 modules)
│   │   ├── services/          # Business Logic (11 modules)
│   │   └── utils/             # Helpers & Validators
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── render.yaml
│   └── .env
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── api/               # API Service Layer (8 modules)
│   │   ├── components/        # Reusable Components (30+)
│   │   ├── context/           # React Context Providers
│   │   ├── hooks/             # Custom Hooks (9 modules)
│   │   ├── pages/             # Page Components (50+)
│   │   ├── routes/            # Route Configuration
│   │   └── utils/             # Constants, Formatters, Validators
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
│
└── README.md
```

---

## 📋 Prerequisites

- **Python 3.12+** with pip
- **Node.js 18+** with npm or yarn
- **MongoDB Atlas** account (free tier)
- **Git** for version control

---

## 🚀 Installation

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/heavenly-nature-school.git
cd heavenly-nature-school/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB Atlas URL and settings
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
# or
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your API URL
```

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Application
ENVIRONMENT=development
DEBUG=true

# MongoDB Atlas
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/hnsdb
MONGODB_DB_NAME=hnsdb

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Admin Seed
ADMIN_EMAIL=admin@school.com
ADMIN_PASSWORD=Admin@2024!

# School Info
SCHOOL_NAME=Heavenly Nature Nursery & Primary School
SCHOOL_MOTTO=Nurturing Right Leaders
SCHOOL_EMAIL=info@school.com
SCHOOL_PHONE=+211 922 273 334

# CORS
ALLOWED_ORIGINS=["http://localhost:5173"]

# Optional Services
EMAIL_ENABLED=false
BREVO_API_KEY=
R2_ACCESS_KEY_ID=
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Heavenly Nature School
VITE_APP_SHORT=HNS
```

---

## 🏃 Running Locally

### Start Backend

```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: **http://localhost:8000**
API Docs at: **http://localhost:8000/docs**

### Start Frontend

```bash
cd frontend
npm run dev
# or
yarn dev
```

Frontend runs at: **http://localhost:5173**

---

## ☁️ Deployment

### Backend (Render)

1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Create new **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables
7. Deploy!

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variable: `VITE_API_URL`
6. Deploy!

### Database (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a **Free M0 Cluster**
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
6. Add to environment variables

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/change-password` | Change password | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |

### Student Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/students` | List all students | Yes |
| POST | `/students` | Enroll new student | Admin |
| GET | `/students/{id}` | Get student details | Yes |
| PUT | `/students/{id}` | Update student | Admin |
| DELETE | `/students/{id}` | Deactivate student | Admin |
| POST | `/students/promote` | Promote students | Admin |
| POST | `/students/bulk/import` | Bulk import students | Admin |

### Teacher Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/teachers` | List all teachers | Yes |
| POST | `/teachers` | Register teacher | Admin |
| GET | `/teachers/{id}` | Get teacher details | Yes |
| PUT | `/teachers/{id}` | Update teacher | Admin |
| POST | `/teachers/{id}/subjects` | Assign subjects | Admin |
| POST | `/teachers/{id}/leave` | Submit leave request | Yes |

*Full API documentation available at `/docs` when running the server*

---

## 📦 Features by Module

### Dashboard
- Real-time statistics overview
- Attendance charts
- Financial summary
- Recent enrollments
- Upcoming events
- Quick actions

### Students
- Complete CRUD operations
- Guardian management
- Academic history tracking
- Attendance summary
- Fee payment history
- Document upload

### Teachers
- Professional profiles
- Subject & class assignments
- Workload monitoring
- Performance reviews
- Training records
- Leave management

### Classes
- Class creation & management
- Timetable scheduling
- Student roster
- Capacity tracking
- Teacher assignment
- Promotion management

### Attendance
- Daily attendance marking
- Bulk attendance entry
- Attendance reports
- Analytics dashboard
- Chronic absenteeism alerts
- Heatmap visualization

### Exams
- Exam scheduling
- Result entry with auto-grading
- Report card generation
- Class rankings
- Performance analytics
- Grade distribution

### Financial
- Transaction management
- Fee structures
- Payment recording
- Budget planning
- Financial reports
- Revenue/expense analytics

---

## 🔑 Default Login

After seeding the database, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@test.com` | `Admin@2024!` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software owned by **Heavenly Nature Nursery & Primary School**. All rights reserved.

---

## 📞 Contact

**Heavenly Nature Nursery & Primary School**
- 📍 Juba, South Sudan
- 📧 info@heavenlynatureschools.com
- 📞 +211 922 273 334

**Developer:** [Your Name]
- GitHub: [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Recharts](https://recharts.org/) - Chart library
- [Lucide React](https://lucide.dev/) - Icon library
- [Render](https://render.com/) - Backend hosting
- [Vercel](https://vercel.com/) - Frontend hosting

---

<div align="center">
  <p>🏫 <strong>Heavenly Nature Nursery & Primary School</strong></p>
  <p><em>"Nurturing Right Leaders"</em></p>
  <p>Juba, South Sudan | 📞 +211 922 273 334 | 📧 info@heavenlynatureschools.com</p>
</div>
```
