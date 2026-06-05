Here's the updated README.md with all the new features:

```markdown
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
- **School Live Stream** — Facebook live integration with real-time chat
- **ID Card Verification** — Public verification page for school ID cards
- **Document Verification** — QR code-based verification for Academic Report Cards & Certificates

### Admin Panel (`/admin/login`)
- Secure JWT authentication (access + refresh tokens)
- Brute-force protection (rate limiting)
- Multi-admin support with role-based permissions (Super Admin, Admin, Moderator)
- Contact form submission management
- Blog post creation and editing with image upload
- Events management with image upload
- **School ID Cards** — Create and manage digital ID cards for staff and students
- **Verification QR Codes** — Generate QR codes for Academic Report Cards (ARC) and Nursery Education Certificates
- **Live Chat Moderation** — Monitor and moderate school live chat
- **Image Upload** — Direct image upload from phone or computer for blogs, events, and ID cards
- Dashboard with live statistics

### ID Card System
- Digital ID cards for all staff and students
- 40+ predefined roles with unique role codes
- Auto-generated member IDs (format: `HNM-{ROLE}-{YEAR}-{SEQ}`)
- Student ID cards (1-year validity) and Staff ID cards (3-year validity)
- Passport photo upload with front ID card image
- QR code linking to public verification page
- Emergency contact information storage
- Advanced fields: DOB, gender, blood group, branch, department
- Anti-screenshot protection on verification page
- School logo and branding on verification cards

### Document Verification System
- **Academic Report Card (ARC)** — Annual QR code verification
- **Certificate of Nursery Education** — Top Class graduation certificate verification
- Customizable year for each verification type
- QR codes link to public verification pages
- Verification status: Active/Inactive toggle
- Certificate count tracking
- School branding on verification pages

### Live Chat System
- Real-time chat on School Live Stream page
- Guest access (no login required)
- Admin auto-detection from JWT token
- Online user count (active in last 5 minutes)
- Message moderation (admin delete)
- Auto-cleanup of old messages (keeps last 500)
- Offline mode support when chat server is unavailable
- REST API-based (no WebSocket dependency)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Tailwind CSS, Shadcn/UI |
| Backend | FastAPI (Python), Motor (async MongoDB driver) |
| Database | MongoDB (Atlas) |
| Auth | JWT (access + refresh tokens), bcrypt |
| File Upload | Multipart form data, aiofiles |
| Icons | Lucide React |
| Toasts | Sonner |
| XSS Protection | DOMPurify |
| QR Codes | api.qrserver.com |
| Hosting | Netlify (frontend) + Render (backend) |
| CDN/DNS | Cloudflare |

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
API Docs: http://localhost:8001/docs

Admin Credentials (Development)

```
Email:    admin@heavenlynature.com   (set via ADMIN_EMAIL env var)
Password: admin123                   (set via ADMIN_PASSWORD env var)
```

The admin user is automatically seeded on backend startup.

Deployment

See DEPLOYMENT.md for complete step-by-step instructions covering:

· MongoDB Atlas setup
· Backend deployment to Render
· Frontend deployment to Netlify
· Custom domain configuration
· Cloudflare DNS setup
· Environment variable reference

Project Structure

```
/
├── backend/
│   ├── server.py              — FastAPI app (auth, contacts, blog, events, ID cards, chat, verification)
│   ├── requirements.txt
│   ├── .env.example
│   └── uploads/               — Uploaded images (blog, events, ID photos)
├── frontend/
│   ├── public/
│   │   └── logo.webp          — School logo
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js       — JWT session management
│   │   ├── utils/
│   │   │   └── api.js               — API fetch helper with token refresh
│   │   ├── pages/
│   │   │   ├── Home.js              — Landing page
│   │   │   ├── Blog.js              — Blog listing
│   │   │   ├── BlogPost.js          — Single blog post
│   │   │   ├── SchoolLive.js        — Live stream + chat
│   │   │   ├── SchoolVerify.js      — ID card verification
│   │   │   ├── VerifyCertificate.js — Document verification
│   │   │   └── admin/
│   │   │       ├── AdminBlog.js     — Blog management
│   │   │       ├── AdminEvents.js   — Events management
│   │   │       ├── AdminIDCard.js   — ID card creation & management
│   │   │       └── AdminVerification.js — QR verification generation
│   │   └── components/
│   │       └── live/
│   │           └── LiveChatPanel.js — Chat panel component
│   ├── netlify.toml                 — SPA routing + security headers
│   └── .env.example
├── DEPLOYMENT.md
└── README.md
```

API Endpoints

Authentication

Method Path Auth Description
POST /api/auth/login — Admin login
POST /api/auth/refresh — Refresh access token
POST /api/auth/logout Bearer Logout
GET /api/admin/profile Bearer Get admin profile
POST /api/admin/change-password Bearer Change password
PUT /api/admin/update-profile Bearer Update profile

Public Content

Method Path Auth Description
POST /api/contact — Submit contact form
GET /api/blog — List blog posts
GET /api/blog/:id — Single blog post
GET /api/events — List events
GET /api/events/:id — Single event
GET /api/health — Health check

Admin - Content Management

Method Path Auth Description
GET /api/admin/contacts Bearer List contact submissions
PATCH /api/admin/contacts/:id Bearer Mark contact as read
DELETE /api/admin/contacts/:id Bearer Delete contact submission
POST /api/admin/blog Bearer Create blog post
PUT /api/admin/blog/:id Bearer Update blog post
DELETE /api/admin/blog/:id Bearer Delete blog post
POST /api/admin/events Bearer Create event
PUT /api/admin/events/:id Bearer Update event
DELETE /api/admin/events/:id Bearer Delete event

Admin - Image Upload

Method Path Auth Description
POST /api/upload Bearer Upload image (general)
POST /api/upload/blog-image Bearer Upload blog image
POST /api/upload/event-image Bearer Upload event image

Admin - ID Cards

Method Path Auth Description
POST /api/admin/id-cards Bearer Create ID card
GET /api/admin/id-cards Bearer List ID cards
DELETE /api/admin/id-cards/:id Bearer Delete ID card
GET /api/admin/roles Bearer Get available roles

Public - Verification

Method Path Auth Description
GET /api/verify/:id — Verify ID card
GET /api/verify/document/:id — Verify document (ARC/Certificate)

Admin - Document Verification

Method Path Auth Description
POST /api/admin/verifications/generate Bearer Generate QR verification
GET /api/admin/verifications Bearer List all verifications
PUT /api/admin/verifications/:id/toggle Bearer Toggle active/inactive
DELETE /api/admin/verifications/:id Bearer Delete verification

Live Chat

Method Path Auth Description
POST /api/live-chat/send Optional Send chat message
GET /api/live-chat/messages — Get recent messages
GET /api/live-chat/online — Online user count
DELETE /api/live-chat/messages/:id Bearer Delete message (admin)
GET /api/live-chat/stats Bearer Chat statistics (admin)

Admin Management (Super Admin Only)

Method Path Auth Description
GET /api/admin/admins Bearer List all admins
POST /api/admin/admins Bearer Create new admin
PUT /api/admin/admins/:id Bearer Update admin
PATCH /api/admin/admins/:id/toggle-status Bearer Toggle admin active
DELETE /api/admin/admins/:id Bearer Delete admin

Dashboard

Method Path Auth Description
GET /api/admin/stats Bearer Dashboard statistics
GET /api/admin/settings Bearer Get settings
POST /api/admin/settings Bearer Save settings

ID Card Role Codes

Role Code Type Expiry
School Director SD Staff 3 years
Principal PR Staff 3 years
Head Teacher HT Staff 3 years
Teacher ED Staff 3 years
Head Prefect HP Student 1 year
Student STU Student 1 year
Pupil PUP Student 1 year

Full list: 40+ roles available. See /api/admin/roles endpoint.

Environment Variables

Backend (backend/.env)

Variable Description Example
JWT_SECRET Secret key for JWT tokens your-secret-key
MONGO_URL MongoDB connection string mongodb+srv://...
DB_NAME Database name heavenly_nature
ADMIN_EMAIL Default admin email admin@heavenlynature.com
ADMIN_PASSWORD Default admin password admin123
CORS_ORIGINS Allowed CORS origins https://heavenlynatureschools.com
UPLOAD_DIR Upload directory path uploads
API_BASE_URL API base URL https://api.heavenlynatureschools.com

Frontend (frontend/.env)

Variable Description Example
REACT_APP_API_URL Backend API URL https://api.heavenlynatureschools.com
REACT_APP_BACKEND_URL WebSocket/chat URL https://api.heavenlynatureschools.com

Database Collections

Collection Description
users Admin accounts with roles & permissions
contacts Contact form submissions
blog_posts Blog articles
events School events
id_cards Staff & student ID cards
document_verifications ARC & Certificate QR verifications
chat_messages Live chat messages
settings Admin dashboard settings

Verification URLs

Type URL Format Description
ID Card https://heavenlynatureschools.com/verify/{id} Verify staff/student ID
Report Card https://heavenlynatureschools.com/verify/{id} Verify Academic Report Card
Certificate https://heavenlynatureschools.com/verify/{id} Verify Nursery Certificate

Contact

· Email: info@heavenlynatureschools.com
· Phone: +211 922 273 334
· WhatsApp: +211 926 006 202
· Location: Juba City, Central Equatoria State, South Sudan
· Facebook: https://www.facebook.com/share/1CPEyYC14f/
· YouTube: https://youtube.com/@heavenlynatureschools

---

© 2026 Heavenly Nature Nursery & Primary School. All rights reserved.
A ministry of Heavenly Nature Ministry.

```
