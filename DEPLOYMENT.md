# Heavenly Nature Schools — Deployment Guide

Stack: **React frontend → Netlify** + **FastAPI backend → Render** + **MongoDB Atlas**

---

## Overview

```
Browser
  └── Netlify (React SPA, built with yarn build)
        └── API calls ──► Render (FastAPI on $PORT)
                              └── MongoDB Atlas (M0 free)
```

**Deploy order: MongoDB Atlas → Backend (Render) → Frontend (Netlify)**

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
   | **Name** | `heavenly-nature-api` |
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
| `CORS_ORIGINS` | `https://heavenlynatureschools.netlify.app` | Your Netlify URL — update after Step 3 |

**Generate JWT_SECRET** (run once locally, paste into Render):
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 2d. Deploy & verify

1. Click **Create Web Service** — Render builds and starts
2. Once live, note your URL: `https://heavenly-nature-api.onrender.com`
3. Test:
   ```
   GET https://heavenly-nature-api.onrender.com/api/health
   → {"status": "ok"}
   ```
4. Admin user is **auto-seeded** from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on first startup

> **Note:** Render free tier sleeps after 15 min idle — first request after sleep takes ~30s.
> Upgrade to Starter ($7/mo) for always-on if needed.

---

## Step 3 — Frontend on Netlify

### 3a. Set the backend URL

You must tell the React app where the backend lives.  
The environment variable is: **`REACT_APP_BACKEND_URL`**

### 3b. Build the frontend

```bash
cd frontend
yarn install
REACT_APP_BACKEND_URL=https://heavenly-nature-api.onrender.com yarn build
```

This produces `frontend/build/` — the folder Netlify serves.

### 3c. Deploy to Netlify

**Option A — Drag & Drop (quickest, no Git needed)**
1. https://app.netlify.com → **Add new site** → **Deploy manually**
2. Drag the `frontend/build/` folder into the upload zone
3. Site goes live at `random-name.netlify.app`

**Option B — Git-connected (recommended for ongoing updates)**
1. https://app.netlify.com → **Add new site** → **Import an existing project**
2. Connect your GitHub repo
3. Build settings:

   | Field | Value |
   |---|---|
   | **Base directory** | `frontend` |
   | **Build command** | `yarn build` |
   | **Publish directory** | `frontend/build` |

4. **Site settings** → **Environment variables** → add:

   | Variable | Value |
   |---|---|
   | `REACT_APP_BACKEND_URL` | `https://heavenly-nature-api.onrender.com` |

5. Trigger a deploy

> The `netlify.toml` inside `frontend/` handles SPA routing (`/* → /index.html`)
> and security headers automatically — no extra configuration needed.

### 3d. Update CORS on Render

After Netlify assigns your URL (e.g. `https://heavenly-nature.netlify.app`):

1. Go back to Render → **Environment** → update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://heavenly-nature.netlify.app
   ```
   If you also have a custom domain:
   ```
   CORS_ORIGINS=https://heavenly-nature.netlify.app,https://heavenlynatureschools.com
   ```
2. Render auto-redeploys with the new value.

### 3e. Custom Domain (optional)

1. Netlify → **Domain settings** → **Add custom domain** → enter `heavenlynatureschools.com`
2. Update your DNS registrar with Netlify's records
3. HTTPS is auto-provisioned via Let's Encrypt

---

## Step 4 — Post-Deployment Checklist

- [ ] `GET /api/health` → `{"status": "ok"}`
- [ ] Admin login at `yourdomain.com/admin/login` works with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- [ ] Contact form submission appears in `/admin/contacts`
- [ ] Blog post created in admin appears on public `/blog`
- [ ] Event created in admin appears on public `/events`
- [ ] All public pages load without errors
- [ ] HTTPS active on both frontend and backend
- [ ] `CORS_ORIGINS` includes your exact Netlify/custom domain

---

## Environment Variables Reference

### Backend — `backend/.env` (local dev) or Render env vars (production)

```env
MONGO_URL="mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority"
DB_NAME="heavenly_nature"
JWT_SECRET="<64-char hex — python3 -c 'import secrets; print(secrets.token_hex(32))'>"
ADMIN_EMAIL="admin@heavenlynatureschools.com"
ADMIN_PASSWORD="<strong-password-min-12-chars>"
CORS_ORIGINS="https://your-site.netlify.app,https://heavenlynatureschools.com"
```

### Frontend — `frontend/.env` (local dev) or Netlify env vars (production)

```env
REACT_APP_BACKEND_URL=https://your-render-service.onrender.com
```

> **Important:** The frontend environment variable is `REACT_APP_BACKEND_URL`.
> (Some docs reference `REACT_APP_API_URL` — the correct name in this codebase is `REACT_APP_BACKEND_URL`.)

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
cp .env.example .env        # fill in values
uvicorn server:app --reload --port 8001

# Terminal 2 — Frontend
cd frontend
yarn install
cp .env.example .env        # set REACT_APP_BACKEND_URL=http://localhost:8001
yarn start
```

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| CORS errors in browser | `CORS_ORIGINS` doesn't match Netlify URL | Update `CORS_ORIGINS` on Render (no trailing slash) |
| "Invalid email or password" on login | Wrong `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars | Check Render env vars match what you type |
| Contact form error | MongoDB connection issue | Verify `MONGO_URL` on Render, check Atlas Network Access |
| MongoDB "connection refused" | Atlas IP whitelist too restrictive | Set Network Access to `0.0.0.0/0` |
| Render sleeping (slow first load) | Free tier idles after 15 min | Upgrade to Starter $7/mo or add a health-check ping |
| Netlify "Page not found" on refresh | Missing SPA redirect | Ensure `netlify.toml` is in the `frontend/` folder |
| API calls failing after login | Cookie not sent cross-origin | Confirm `REACT_APP_BACKEND_URL` has no trailing slash |

---

## Cost Summary

| Service | Plan | Monthly Cost |
|---|---|---|
| MongoDB Atlas | M0 Free (512 MB) | **$0** |
| Render Backend | Free (sleeps after 15 min idle) | **$0** |
| Netlify Frontend | Free (100 GB bandwidth) | **$0** |
| Domain name | e.g. Namecheap | ~$1/mo (billed yearly) |

**Total: $0/month** on free tiers. Upgrade Render to Starter ($7/mo) for production always-on.

---

## Social & Contact

- **Facebook**: https://www.facebook.com/share/1CPEyYC14f/
- **YouTube**: https://youtube.com/@heavenlynatureschools
- **Phone**: +211 922 273 334 / +211 926 006 202 (WhatsApp)
- **Email**: info@heavenlynatureschools.com
