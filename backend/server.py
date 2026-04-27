Update and add this to server if it is missing 
# Add to server.py

# Change password endpoint
@api_router.post("/admin/change-password")
async def change_password(
    request: Request,
    user: dict = Depends(require_admin)
):
    data = await request.json()
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")
    
    # Get user from database
    db_user = await db.users.find_one({"_id": ObjectId(user["sub"])})
    
    if not verify_password(current_password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    # Update password
    new_hash = hash_password(new_password)
    await db.users.update_one(
        {"_id": ObjectId(user["sub"])},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"message": "Password changed successfully"}

# Update profile endpoint
@api_router.put("/admin/update-profile")
async def update_profile(
    request: Request,
    user: dict = Depends(require_admin)
):
    data = await request.json()
    
    await db.users.update_one(
        {"_id": ObjectId(user["sub"])},
        {"$set": {
            "name": data.get("name"),
            "email": data.get("email"),
            "phone": data.get("phone")
        }}
    )
    
    return {"message": "Profile updated successfully"}
    
    
    

backend/server.py 

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MIN = 60  # 1 hour
REFRESH_TOKEN_EXPIRE_DAYS = 7

# ─────────────────────────────────────────────────────────────
# DB
# ─────────────────────────────────────────────────────────────

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

# ─────────────────────────────────────────────────────────────
# APP
# ─────────────────────────────────────────────────────────────

app = FastAPI(title="Heavenly Nature Schools API", version="1.0.0")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# UTILS
# ─────────────────────────────────────────────────────────────

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc

# ─────────────────────────────────────────────────────────────
# AUTH HELPERS
# ─────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(user: dict) -> str:
    payload = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user.get("role", "user"),
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MIN),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user: dict) -> str:
    payload = {
        "sub": str(user["_id"]),
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─────────────────────────────────────────────────────────────
# AUTH DEPENDENCIES
# ─────────────────────────────────────────────────────────────

async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header.split(" ")[1]
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")

    return payload

async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ─────────────────────────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    subject: str
    message: str

class ContactUpdate(BaseModel):
    read: bool

class BlogPostCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    imageUrl: Optional[str] = ""
    publishDate: str

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    imageUrl: Optional[str] = None
    publishDate: Optional[str] = None

class EventCreate(BaseModel):
    title: str
    description: str
    eventDate: str
    location: Optional[str] = ""
    imageUrl: Optional[str] = ""

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    eventDate: Optional[str] = None
    location: Optional[str] = None
    imageUrl: Optional[str] = None

class AdminSettings(BaseModel):
    darkMode: bool = False
    emailNotifications: bool = True
    pushNotifications: bool = False
    notifyNewContacts: bool = True
    notifyNewBlogPosts: bool = False
    itemsPerPage: int = 10
    dateFormat: str = "MM/DD/YYYY"
    sessionTimeout: int = 30
    twoFactorAuth: bool = False
    siteName: str = "Heavenly Nature Schools"
    siteEmail: str = "info@heavenlynature.com"
    contactPhone: str = ""
    contactAddress: str = ""
    facebook: str = ""
    twitter: str = ""
    instagram: str = ""
    linkedin: str = ""

# ─────────────────────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────────────────────

@api_router.post("/auth/login")
async def login(data: LoginRequest):
    user = await db.users.find_one({"email": data.email.lower()})

    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "access_token": create_access_token(user),
        "refresh_token": create_refresh_token(user),
        "user": {
            "email": user["email"],
            "role": user.get("role", "user"),
            "name": user.get("name", user["email"].split("@")[0])
        }
    }

@api_router.post("/auth/refresh")
async def refresh(data: RefreshRequest):
    payload = decode_token(data.refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "access_token": create_access_token(user)
    }

@api_router.post("/auth/logout")
async def logout(user: dict = Depends(require_admin)):
    # In a stateless JWT system, logout is handled client-side
    # This endpoint exists for future blacklist implementation
    return {"message": "Logged out successfully"}

# ─────────────────────────────────────────────────────────────
# CONTACT ROUTES (Full CRUD)
# ─────────────────────────────────────────────────────────────

@api_router.post("/contact")
async def submit_contact(data: ContactCreate):
    doc = data.model_dump()
    doc["date"] = datetime.now(timezone.utc).isoformat()
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    doc["read"] = False
    result = await db.contacts.insert_one(doc)
    return {"success": True, "id": str(result.inserted_id)}

@api_router.get("/admin/contacts")
async def get_contacts(user=Depends(require_admin)):
    contacts = await db.contacts.find({}).sort("createdAt", -1).to_list(1000)
    return [serialize_doc(c) for c in contacts]

@api_router.get("/admin/contacts/{contact_id}")
async def get_contact(contact_id: str, user=Depends(require_admin)):
    contact = await db.contacts.find_one({"_id": ObjectId(contact_id)})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return serialize_doc(contact)

@api_router.patch("/admin/contacts/{contact_id}")
async def update_contact(contact_id: str, data: ContactUpdate, user=Depends(require_admin)):
    result = await db.contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": {"read": data.read}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact updated successfully"}

@api_router.delete("/admin/contacts/{contact_id}")
async def delete_contact(contact_id: str, user=Depends(require_admin)):
    result = await db.contacts.delete_one({"_id": ObjectId(contact_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact deleted successfully"}

# ─────────────────────────────────────────────────────────────
# BLOG ROUTES (Full CRUD)
# ─────────────────────────────────────────────────────────────

@api_router.get("/blog")
async def get_blog_posts():
    posts = await db.blog_posts.find({}).sort("publishDate", -1).to_list(1000)
    return [serialize_doc(p) for p in posts]

@api_router.get("/blog/{post_id}")
async def get_blog_post(post_id: str):
    post = await db.blog_posts.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return serialize_doc(post)

@api_router.post("/admin/blog")
async def create_blog_post(data: BlogPostCreate, user=Depends(require_admin)):
    doc = data.model_dump()
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.blog_posts.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Blog post created successfully"}

@api_router.put("/admin/blog/{post_id}")
async def update_blog_post(post_id: str, data: BlogPostUpdate, user=Depends(require_admin)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.blog_posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"message": "Blog post updated successfully"}

@api_router.delete("/admin/blog/{post_id}")
async def delete_blog_post(post_id: str, user=Depends(require_admin)):
    result = await db.blog_posts.delete_one({"_id": ObjectId(post_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"message": "Blog post deleted successfully"}

# ─────────────────────────────────────────────────────────────
# EVENT ROUTES (Full CRUD)
# ─────────────────────────────────────────────────────────────

@api_router.get("/events")
async def get_events():
    events = await db.events.find({}).sort("eventDate", 1).to_list(1000)
    return [serialize_doc(e) for e in events]

@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return serialize_doc(event)

@api_router.post("/admin/events")
async def create_event(data: EventCreate, user=Depends(require_admin)):
    doc = data.model_dump()
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.events.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Event created successfully"}

@api_router.put("/admin/events/{event_id}")
async def update_event(event_id: str, data: EventUpdate, user=Depends(require_admin)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.events.update_one(
        {"_id": ObjectId(event_id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event updated successfully"}

@api_router.delete("/admin/events/{event_id}")
async def delete_event(event_id: str, user=Depends(require_admin)):
    result = await db.events.delete_one({"_id": ObjectId(event_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

# ─────────────────────────────────────────────────────────────
# ADMIN STATS ROUTE
# ─────────────────────────────────────────────────────────────

@api_router.get("/admin/stats")
async def get_admin_stats(user=Depends(require_admin)):
    contacts_count = await db.contacts.count_documents({})
    unread_count = await db.contacts.count_documents({"read": False})
    blog_count = await db.blog_posts.count_documents({})
    events_count = await db.events.count_documents({})
    upcoming_events = await db.events.count_documents({
        "eventDate": {"$gte": datetime.now(timezone.utc).isoformat()}
    })
    
    return {
        "contacts": contacts_count,
        "unreadContacts": unread_count,
        "blogPosts": blog_count,
        "events": events_count,
        "upcomingEvents": upcoming_events
    }

# ─────────────────────────────────────────────────────────────
# ADMIN SETTINGS ROUTES
# ─────────────────────────────────────────────────────────────

@api_router.get("/admin/settings")
async def get_settings(user=Depends(require_admin)):
    settings = await db.settings.find_one({"_id": "admin_settings"})
    if not settings:
        return AdminSettings().dict()
    del settings["_id"]
    return settings

@api_router.post("/admin/settings")
async def save_settings(settings_data: AdminSettings, user=Depends(require_admin)):
    await db.settings.update_one(
        {"_id": "admin_settings"},
        {"$set": settings_data.dict()},
        upsert=True
    )
    return {"message": "Settings saved successfully"}

# ─────────────────────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────────────────────

@api_router.get("/health")
async def health():
    # Check database connection
    try:
        await db.command('ping')
        db_status = "connected"
    except:
        db_status = "disconnected"
    
    return {
        "status": "ok",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/")
async def root():
    return {
        "message": "Heavenly Nature Schools API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# ─────────────────────────────────────────────────────────────
# STARTUP
# ─────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    # Create admin user if not exists
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@heavenlynature.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")

    existing = await db.users.find_one({"email": admin_email})

    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "name": "Administrator",
            "createdAt": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    else:
        logger.info("Admin user already exists")
    
    # Create indexes for better performance
    await db.contacts.create_index("createdAt")
    await db.contacts.create_index("read")
    await db.blog_posts.create_index("publishDate")
    await db.events.create_index("eventDate")
    await db.users.create_index("email", unique=True)
    
    logger.info("Database indexes created")
    logger.info("Server startup complete")

# ─────────────────────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# ─────────────────────────────────────────────────────────────
# ROOT ROUTE
# ─────────────────────────────────────────────────────────────

@app.get("/")
async def root_redirect():
    return {
        "message": "Heavenly Nature Schools API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "api": "/api"
    }
