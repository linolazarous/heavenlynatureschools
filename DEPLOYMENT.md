```markdown
# Heavenly Nature Schools — Deployment Guide

Stack: **React frontend → Vercel** + **FastAPI backend → Render** + **MongoDB Atlas**

---

## Overview

```

Browser
└── Cloudflare (CDN + DNS)
└── Vercel (React SPA, built with yarn build)
└── API calls ──► Render (FastAPI on $PORT)
└── MongoDB Atlas (M0 free)

```

**Deploy order: MongoDB Atlas → Backend (Render) → Frontend (Vercel) → Cloudflare DNS**

---

## Step 1 — MongoDB Atlas (Database)

1. Sign up at https://cloud.mongodb.com — free M0 cluster is sufficient
2. **Create Project** → **Build a Cluster** → choose **M0 Free**
3. **Database Access**: add a user (e.g. `heavenly-admin`) with a strong password
4. **Network Access**: add `0.0.0.0/0` (required for Render's dynamic IPs)
5. **Connect** → **Drivers** → copy the connection string:
```

mongodb+srv://heavenly-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

```
6. Replace `<password>` with your database user password — save this string for Step 2.

---

## Step 2 — Backend on Render

### 2a. Push code to GitHub
Push at minimum the `backend/` directory to a GitHub repository.

### 2b. Create Render Web Service

1. https://render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

   | Field | Value |
   |---|---|
   | **Name** | `heavenlynatureschools-api` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
   | **Instance Type** | Free |

### 2c. Environment Variables

In Render → **Environment** tab, add **all** of these:

| Variable | Value | Notes |
|---|---|---|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/...` | From Atlas Step 1 |
| `DB_NAME` | `heavenly_nature` | Your database name |
| `JWT_SECRET` | *(generate below)* | 64-char hex secret — keep private |
| `ADMIN_EMAIL` | `admin@heavenlynatureschools.com` | Your admin login email |
| `ADMIN_PASSWORD` | *(strong password)* | Min 12 chars recommended |
| `CORS_ORIGINS` | `https://heavenlynatureschools.com,https://www.heavenlynatureschools.com` | Your domain(s) — comma separated, no spaces |
| `API_BASE_URL` | `https://api.heavenlynatureschools.com` | If using api subdomain |
| `UPLOAD_DIR` | `uploads` | Directory for uploaded images |

**Generate JWT_SECRET** (run once locally, paste into Render):
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

2d. Deploy & verify

1. Click Create Web Service — Render builds and starts
2. Once live, note your URL: https://heavenlynatureschools-api.onrender.com
3. Test:
   ```
   GET https://heavenlynatureschools-api.onrender.com/api/health
   → {"status": "ok", "database": "connected", "timestamp": "..."}
   ```
4. Admin user is auto-seeded from ADMIN_EMAIL / ADMIN_PASSWORD on first startup
5. Database collections and indexes are auto-created on startup

Note: Render free tier sleeps after 15 min idle — first request after sleep takes ~30s.
Upgrade to Starter ($7/mo) for always-on if needed.

---

Step 3 — Frontend on Vercel

3a. Set the backend URL

The frontend uses two environment variables:

· REACT_APP_API_URL — for REST API calls
· REACT_APP_BACKEND_URL — for WebSocket/chat connections

3b. Build the frontend (locally for testing)

```bash
cd frontend
yarn install
REACT_APP_API_URL=https://api.heavenlynatureschools.com yarn build
```

This produces frontend/build/ — the folder Vercel serves.

3c. Deploy to Vercel

Option A — Vercel CLI (quick)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

Option B — Git-connected (recommended for ongoing updates)

1. https://vercel.com → Add New → Project
2. Connect your GitHub repo
3. Configure build settings:
   Field Value
   Framework Preset Create React App
   Root Directory frontend
   Build Command yarn build
   Output Directory build
4. Environment Variables → add:
   Variable Value
   REACT_APP_API_URL https://api.heavenlynatureschools.com
   REACT_APP_BACKEND_URL https://api.heavenlynatureschools.com
5. Click Deploy

3d. Vercel SPA Routing

Create a vercel.json file in the frontend/ directory (or add to existing):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

This handles SPA routing so all routes go to index.html.

3e. Update CORS on Render

After Vercel assigns your URL or you set up custom domain:

1. Go back to Render → Environment → update CORS_ORIGINS:
   ```
   CORS_ORIGINS=https://heavenlynatureschools.com,https://www.heavenlynatureschools.com
   ```
   (Add Vercel preview URL too if needed: ,https://your-project.vercel.app)
2. Render auto-redeploys with the new value.

3f. Custom Domain Setup (Cloudflare + Vercel)

Since you're using Cloudflare as DNS/CDN:

1. Cloudflare DNS Records:
   Type Name Target Proxy
   CNAME @ cname.vercel-dns.com 🟠 Proxied
   CNAME www cname.vercel-dns.com 🟠 Proxied
   CNAME api heavenlynatureschools-api.onrender.com 🟠 Proxied
2. Cloudflare SSL/TLS: Set to Full or Full (strict)
3. Vercel:
   · Go to your project → Settings → Domains
   · Add heavenlynatureschools.com and www.heavenlynatureschools.com
   · Vercel provides DNS records — use Cloudflare instead for CDN
4. HTTPS is auto-provisioned via Let's Encrypt (Vercel) and Cloudflare

---

Step 4 — Post-Deployment Checklist

Basic Functionality

· GET /api/health → {"status": "ok", "database": "connected"}
· Admin login at heavenlynatureschools.com/admin/login works
· Contact form submission appears in /admin/contacts
· Blog post created in admin appears on public /blog
· Event created in admin appears on public /events
· All public pages load without errors
· HTTPS active on both frontend and backend

Image Upload

· Blog image upload works (admin → blog → upload image)
· Event image upload works (admin → events → upload image)
· Uploaded images display correctly on public pages
· Image preview shows before submitting

ID Cards

· School ID Cards page loads in admin (/admin/id-cards)
· Can create ID card with name, role, and images
· ID card appears in list after creation
· Public verification at heavenlynatureschools.com/verify/{id} works
· Verification page shows photo, name, member ID, expiry date
· School logo appears on verification page
· Student ID / Staff ID label changes based on role
· Anti-screenshot protection active on verification page

Document Verification (ARC & Certificates)

· Verification QR Codes page loads in admin
· Can generate Academic Report Card QR for a year
· Can generate Certificate of Nursery Education QR for a year
· QR codes display in admin list
· Copy link button works
· Public verification at heavenlynatureschools.com/verify/{id} works
· Verification page shows document type, year, and school info
· "Verified Authentic" message displays correctly

Live Chat

· School Live Stream page loads (/school-live)
· Facebook live section displays (or fallback)
· Chat panel visible with online count
· Can send messages as guest
· Messages appear in chat
· Chat works in offline mode (no server connection)

Security

· CORS_ORIGINS includes your exact domain(s)
· JWT tokens refresh properly
· Admin-only endpoints return 401 without token
· File upload validates image types
· File upload limits size to 5MB

---

Environment Variables Reference

Backend — backend/.env (local dev) or Render env vars (production)

```env
MONGO_URL="mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority"
DB_NAME="heavenly_nature"
JWT_SECRET="<64-char hex — python3 -c 'import secrets; print(secrets.token_hex(32))'>"
ADMIN_EMAIL="admin@heavenlynatureschools.com"
ADMIN_PASSWORD="<strong-password-min-12-chars>"
CORS_ORIGINS="https://heavenlynatureschools.com,https://www.heavenlynatureschools.com"
API_BASE_URL="https://api.heavenlynatureschools.com"
UPLOAD_DIR="uploads"
```

Frontend — frontend/.env (local dev) or Vercel env vars (production)

```env
REACT_APP_API_URL=https://api.heavenlynatureschools.com
REACT_APP_BACKEND_URL=https://api.heavenlynatureschools.com
```

---

Local Development

```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
cp .env.example .env        # fill in values
uvicorn server:app --reload --port 8001

# Terminal 2 — Frontend
cd frontend
yarn install
cp .env.example .env        # set REACT_APP_API_URL=http://localhost:8001
yarn start
```

Frontend: http://localhost:3000
Backend: http://localhost:8001
API Docs: http://localhost:8001/docs
Admin: http://localhost:3000/admin/login

---

Database Collections

Collection Description Auto-created
users Admin accounts ✅ On startup
contacts Contact form submissions ✅ On first use
blog_posts Blog articles ✅ On first use
events School events ✅ On first use
id_cards Staff & student ID cards ✅ On first use
document_verifications ARC & Certificate QR codes ✅ On first use
chat_messages Live chat messages ✅ On first use
settings Admin dashboard settings ✅ On first use

---

Troubleshooting

Problem Likely cause Fix
CORS errors in browser CORS_ORIGINS doesn't match domain Update CORS_ORIGINS on Render (no trailing slash, no spaces)
"Invalid email or password" on login Wrong ADMIN_EMAIL/ADMIN_PASSWORD Check Render env vars match what you type
Contact form error MongoDB connection issue Verify MONGO_URL on Render, check Atlas Network Access
MongoDB "connection refused" Atlas IP whitelist too restrictive Set Network Access to 0.0.0.0/0
Render sleeping (slow first load) Free tier idles after 15 min Upgrade to Starter $7/mo or add a health-check ping
Vercel "Page not found" on refresh Missing SPA redirect Ensure vercel.json has rewrite rule to index.html
Images not displaying Wrong API_BASE_URL or path format Check image URL starts with https://api... or /uploads/...
ID card creation fails Missing aiofiles dependency pip install aiofiles (already in requirements.txt)
ID verification shows "not found" Wrong ID format Check both id field and _id are searchable
Chat messages not sending Socket.io not installed Chat uses REST API fallback — no socket.io needed
White screen on School Live page AuthContext error Updated to work without AuthContext wrapper
Cloudflare DNS not resolving Incorrect CNAME target Use cname.vercel-dns.com for Vercel, remove https:// prefix
QR code image not loading External API rate limit QR codes from api.qrserver.com — works offline in admin
Upload size exceeded File > 5MB Resize image before upload or increase MAX_UPLOAD_SIZE
Vercel build fails Wrong Node version Set Node.js version in Vercel project settings (18.x or 20.x)

---

Architecture Notes

Frontend Pages

Route Component Auth Required
/ Home No
/blog Blog No
/blog/:id BlogPost No
/events Events No
/school-live SchoolLive No
/verify/:id SchoolVerify / VerifyCertificate No
/admin/login AdminLogin No
/admin/* Admin pages Yes

API Architecture

· REST API: FastAPI with JWT Bearer tokens
· File Storage: Local disk on Render (uploads/ directory)
· Static Files: Mounted at /uploads via FastAPI StaticFiles
· Chat: REST polling (no WebSocket dependency)
· QR Codes: Generated via external API (api.qrserver.com)

Security Features

· JWT with access + refresh tokens (60 min / 7 days)
· bcrypt password hashing
· Role-based access (super_admin, admin, moderator)
· CORS origin whitelisting
· File type validation (images only)
· File size limits (5MB)
· Anti-screenshot on ID verification pages
· XSS protection via DOMPurify on blog content

---

Cost Summary

Service Plan Monthly Cost
MongoDB Atlas M0 Free (512 MB) $0
Render Backend Free (sleeps after 15 min idle) $0
Vercel Frontend Free (100 GB bandwidth) $0
Cloudflare Free CDN + DNS $0
Domain name e.g. Namecheap ~$1/mo (billed yearly)

**Total: $0/month** on free tiers. Upgrade Render to Starter ($7/mo) for production always-on.

---

Social & Contact

· Facebook: https://www.facebook.com/share/1CPEyYC14f/
· YouTube: https://youtube.com/@heavenlynatureschools
· Phone: +211 922 273 334 / +211 926 006 202 (WhatsApp)
· Email: info@heavenlynatureschools.com
· Website: https://heavenlynatureschools.com
· API: https://api.heavenlynatureschools.com

```
