# Heavenly Nature Nursery & Primary School Website

**Nurturing Right Leaders**

A faith-based educational institution providing free education to street children, abandoned children, and orphans in Juba City, South Sudan.

## Features

### Public Website
- Modern, responsive design optimized for all devices
- Home, About, Vision & Mission, Programs, Governance, Partnerships, Support, Blog, Events, Contact
- Blog section for news and updates (live from MongoDB)
- Events calendar for upcoming activities (live from MongoDB)
- Contact form that saves submissions to the database
- Social media integration (Facebook, YouTube, WhatsApp)

### Admin Panel (`/admin/login`)
- Secure JWT authentication (httpOnly cookies, 24-hour sessions)
- Brute-force protection (5 attempts → 15-minute lockout)
- Contact form submission management
- Blog post creation and editing
- Events management
- Dashboard with live statistics

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Tailwind CSS, Shadcn/UI |
| Backend | FastAPI (Python), Motor (async MongoDB driver) |
| Database | MongoDB (Atlas) |
| Auth | JWT httpOnly cookies, bcrypt, brute-force lockout |
| Icons | Lucide React |
| Toasts | Sonner |
| XSS protection | DOMPurify |
| Hosting | Netlify (frontend) + Render (backend) |

## Quick Start (Local Development)

```bash
# Backend
cd backend
pip install -r requirements.txt
# Copy .env.example to .env and fill in values
cp .env.example .env
uvicorn server:app --reload --port 8001

# Frontend (new terminal)
cd frontend
yarn install
# Copy .env.example to .env and fill in values
cp .env.example .env
yarn start
```

Frontend: http://localhost:3000  
Backend: http://localhost:8001  
Admin: http://localhost:3000/admin/login

## Admin Credentials (Development)

```
Email:    admin@heavenlynature.com   (set via ADMIN_EMAIL env var)
Password: admin123                   (set via ADMIN_PASSWORD env var)
```

The admin user is automatically seeded on backend startup.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step instructions covering:
- MongoDB Atlas setup
- Backend deployment to Render
- Frontend deployment to Netlify
- Custom domain configuration
- Environment variable reference

## Project Structure

```
/
├── backend/
│   ├── server.py          — FastAPI app (auth, contacts, blog, events)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── context/AuthContext.js   — JWT session management
│   │   ├── utils/api.js             — API fetch helper
│   │   ├── pages/                   — All public + admin pages
│   │   └── components/              — Header, Footer, UI components
│   ├── netlify.toml                 — SPA routing + security headers
│   └── .env.example
├── DEPLOYMENT.md
└── README.md
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Admin login |
| POST | `/api/auth/logout` | Cookie | Logout |
| GET | `/api/auth/me` | Cookie | Current user |
| POST | `/api/contact` | — | Submit contact form |
| GET | `/api/blog` | — | List blog posts |
| GET | `/api/blog/:id` | — | Single blog post |
| GET | `/api/events` | — | List events |
| GET | `/api/events/:id` | — | Single event |
| GET | `/api/admin/contacts` | Cookie | List submissions |
| DELETE | `/api/admin/contacts/:id` | Cookie | Delete submission |
| POST/PUT/DELETE | `/api/admin/blog/:id` | Cookie | Blog CRUD |
| POST/PUT/DELETE | `/api/admin/events/:id` | Cookie | Events CRUD |
| GET | `/api/admin/stats` | Cookie | Dashboard counts |

## Contact

- **Email**: info@heavenlynatureschools.com
- **Phone**: +211 922 273 334
- **WhatsApp**: +211 926 006 202
- **Location**: Juba City, Central Equatoria State, South Sudan
- **Facebook**: https://www.facebook.com/share/1CPEyYC14f/
- **YouTube**: https://youtube.com/@heavenlynatureschools

---

© 2025 Heavenly Nature Nursery & Primary School. All rights reserved.  
A ministry of Heavenly Nature Ministry.
