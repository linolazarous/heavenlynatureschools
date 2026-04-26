from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, Request, Response, Depends, HTTPException
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List
import os
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# ─── Password + JWT helpers ──────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one(
            {"_id": ObjectId(payload["sub"])},
            {"_id": 0, "password_hash": 0}
        )
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ─── Pydantic models ─────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    subject: str
    message: str

class BlogPostCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    imageUrl: Optional[str] = ""
    publishDate: str

class ContactReadUpdate(BaseModel):
    read: bool

class EventCreate(BaseModel):
    title: str
    description: str
    eventDate: str
    location: Optional[str] = ""
    imageUrl: Optional[str] = ""


# ─── Helper ──────────────────────────────────────────────────────────────────

def serialize_doc(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


# ─── Auth routes ─────────────────────────────────────────────────────────────

BRUTE_MAX_ATTEMPTS = 5
BRUTE_LOCKOUT_MINUTES = 15

def _real_client_ip(request: Request) -> str:
    # Behind reverse proxies / load balancers, request.client.host is the LB's pod IP
    # and changes across requests, breaking per-identifier lockout counters.
    # Prefer X-Forwarded-For, then X-Real-IP, then request.client.
    xff = request.headers.get("x-forwarded-for", "")
    if xff:
        return xff.split(",")[0].strip()
    xri = request.headers.get("x-real-ip", "")
    if xri:
        return xri.strip()
    return request.client.host if request.client else "unknown"


@api_router.post("/auth/login")
async def login(data: LoginRequest, request: Request, response: Response):
    identifier = f"{_real_client_ip(request)}:{data.email.lower().strip()}"
    # Check lockout
    attempt_doc = await db.login_attempts.find_one({"identifier": identifier})
    if attempt_doc:
        if attempt_doc.get("count", 0) >= BRUTE_MAX_ATTEMPTS:
            locked_at = datetime.fromisoformat(attempt_doc["locked_at"])
            if datetime.now(timezone.utc) < locked_at + timedelta(minutes=BRUTE_LOCKOUT_MINUTES):
                raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
            else:
                await db.login_attempts.delete_one({"identifier": identifier})

    user = await db.users.find_one({"email": data.email.lower().strip()})
    if not user or not verify_password(data.password, user["password_hash"]):
        # Increment attempt counter
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Success — clear attempts
    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(str(user["_id"]), user["email"])
    response.set_cookie(
        key="access_token", value=token,
        httponly=True, secure=False, samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_HOURS * 3600, path="/"
    )
    return {"email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def me(current_user=Depends(get_current_user)):
    return current_user


# ─── Contact routes ──────────────────────────────────────────────────────────

@api_router.post("/contact")
async def submit_contact(data: ContactCreate):
    doc = data.model_dump()
    doc["date"] = datetime.now(timezone.utc).isoformat()
    doc["read"] = False
    result = await db.contacts.insert_one(doc)
    return {"success": True, "id": str(result.inserted_id)}

@api_router.get("/admin/contacts")
async def get_contacts(current_user=Depends(get_current_user)):
    contacts = await db.contacts.find({}).sort("date", -1).to_list(1000)
    return [serialize_doc(c) for c in contacts]

@api_router.patch("/admin/contacts/{contact_id}")
async def toggle_contact_read(contact_id: str, data: ContactReadUpdate, current_user=Depends(get_current_user)):
    result = await db.contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": {"read": data.read}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"success": True, "read": data.read}

@api_router.delete("/admin/contacts/{contact_id}")
async def delete_contact(contact_id: str, current_user=Depends(get_current_user)):
    result = await db.contacts.delete_one({"_id": ObjectId(contact_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"success": True}


# ─── Blog routes ─────────────────────────────────────────────────────────────

@api_router.get("/blog")
async def get_blog_posts():
    posts = await db.blog_posts.find({}).sort("publishDate", -1).to_list(1000)
    return [serialize_doc(p) for p in posts]

@api_router.get("/blog/{post_id}")
async def get_blog_post(post_id: str):
    post = None
    try:
        post = await db.blog_posts.find_one({"_id": ObjectId(post_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Post not found")
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return serialize_doc(post)

@api_router.post("/admin/blog")
async def create_blog_post(data: BlogPostCreate, current_user=Depends(get_current_user)):
    doc = data.model_dump()
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.blog_posts.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/blog/{post_id}")
async def update_blog_post(post_id: str, data: BlogPostCreate, current_user=Depends(get_current_user)):
    doc = data.model_dump()
    result = await db.blog_posts.update_one({"_id": ObjectId(post_id)}, {"$set": doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    updated = await db.blog_posts.find_one({"_id": ObjectId(post_id)})
    return serialize_doc(updated)

@api_router.delete("/admin/blog/{post_id}")
async def delete_blog_post(post_id: str, current_user=Depends(get_current_user)):
    result = await db.blog_posts.delete_one({"_id": ObjectId(post_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True}


# ─── Events routes ───────────────────────────────────────────────────────────

@api_router.get("/events")
async def get_events():
    events = await db.events.find({}).sort("eventDate", -1).to_list(1000)
    return [serialize_doc(e) for e in events]

@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    event = None
    try:
        event = await db.events.find_one({"_id": ObjectId(event_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Event not found")
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return serialize_doc(event)

@api_router.post("/admin/events")
async def create_event(data: EventCreate, current_user=Depends(get_current_user)):
    doc = data.model_dump()
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.events.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/events/{event_id}")
async def update_event(event_id: str, data: EventCreate, current_user=Depends(get_current_user)):
    doc = data.model_dump()
    result = await db.events.update_one({"_id": ObjectId(event_id)}, {"$set": doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    updated = await db.events.find_one({"_id": ObjectId(event_id)})
    return serialize_doc(updated)

@api_router.delete("/admin/events/{event_id}")
async def delete_event(event_id: str, current_user=Depends(get_current_user)):
    result = await db.events.delete_one({"_id": ObjectId(event_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"success": True}


# ─── Admin stats ─────────────────────────────────────────────────────────────

@api_router.get("/admin/stats")
async def get_admin_stats(current_user=Depends(get_current_user)):
    contacts = await db.contacts.count_documents({})
    unread_contacts = await db.contacts.count_documents({"read": False})
    blog_posts = await db.blog_posts.count_documents({})
    events = await db.events.count_documents({})
    return {"contacts": contacts, "unreadContacts": unread_contacts, "blogPosts": blog_posts, "events": events}


# ─── Health check ────────────────────────────────────────────────────────────

@api_router.get("/health")
async def health():
    return {"status": "ok"}


# ─── Startup / Shutdown ──────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@heavenlynature.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info(f"Admin password updated: {admin_email}")
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    logger.info("Backend startup complete")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ─── Mount router + CORS ─────────────────────────────────────────────────────

app.include_router(api_router)

_cors_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]

if "*" in _cors_origins:
    # Wildcard with credentials: use allow_origin_regex instead of allow_origins=["*"]
    # (Starlette raises ValueError if allow_origins=["*"] is combined with allow_credentials=True)
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
