from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, EmailStr
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

app = FastAPI(title="Heavenly Nature Schools API", version="2.0.0")
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
    # Remove sensitive fields
    doc.pop("password_hash", None)
    return doc

def serialize_admin_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Serialize admin document with permissions"""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password_hash", None)
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
        "role": user.get("role", "admin"),
        "name": user.get("name", user["email"].split("@")[0]),
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
    """Allow all admin roles (super_admin, admin, moderator)"""
    if user.get("role") not in ["super_admin", "admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if admin is active
    db_user = await db.users.find_one({"_id": ObjectId(user["sub"])})
    if not db_user or not db_user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    return user

async def require_super_admin(user: dict = Depends(get_current_user)):
    """Only allow super admin"""
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    # Check if super admin is active
    db_user = await db.users.find_one({"_id": ObjectId(user["sub"])})
    if not db_user or not db_user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
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
    siteEmail: str = "info@heavenlynatureschools.com"
    contactPhone: str = ""
    contactAddress: str = ""
    facebook: str = ""
    twitter: str = ""
    instagram: str = ""
    linkedin: str = ""

class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str

class UpdateProfileRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""

# ─────────────────────────────────────────────────────────────
# NEW MODELS FOR MULTI-ADMIN SUPPORT
# ─────────────────────────────────────────────────────────────

class AdminPermissions(BaseModel):
    can_manage_admins: bool = False
    can_manage_products: bool = True
    can_manage_orders: bool = True
    can_manage_users: bool = False
    can_manage_content: bool = True
    can_view_analytics: bool = True
    can_manage_settings: bool = False

class CreateAdminRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "admin"  # super_admin, admin, moderator
    permissions: Optional[AdminPermissions] = None

class UpdateAdminRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    permissions: Optional[AdminPermissions] = None
    password: Optional[str] = None

# ─────────────────────────────────────────────────────────────
# AUTH ROUTES (Updated for multi-admin)
# ─────────────────────────────────────────────────────────────

@api_router.post("/auth/login")
async def login(data: LoginRequest):
    # Try to find user in users collection
    user = await db.users.find_one({"email": data.email.lower()})

    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check if user is active (for admin accounts)
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account has been deactivated")

    # Update last login
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )

    # Get permissions if they exist
    permissions = user.get("permissions", {})
    if not permissions and user.get("role") == "super_admin":
        # Super admin gets all permissions
        permissions = {
            "can_manage_admins": True,
            "can_manage_products": True,
            "can_manage_orders": True,
            "can_manage_users": True,
            "can_manage_content": True,
            "can_view_analytics": True,
            "can_manage_settings": True
        }

    return {
        "access_token": create_access_token(user),
        "refresh_token": create_refresh_token(user),
        "user": {
            "email": user["email"],
            "role": user.get("role", "admin"),
            "name": user.get("name", user["email"].split("@")[0]),
            "permissions": permissions
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

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account has been deactivated")

    return {
        "access_token": create_access_token(user)
    }

@api_router.post("/auth/logout")
async def logout(user: dict = Depends(require_admin)):
    return {"message": "Logged out successfully"}

# ─────────────────────────────────────────────────────────────
# ADMIN MANAGEMENT ROUTES (NEW - Multi-Admin Support)
# ─────────────────────────────────────────────────────────────

@api_router.get("/admin/admins")
async def get_all_admins(user: dict = Depends(require_super_admin)):
    """Get all admin accounts (Super admin only)"""
    admins = await db.users.find(
        {"role": {"$in": ["super_admin", "admin", "moderator"]}}
    ).sort("created_at", -1).to_list(100)
    
    return {
        "success": True,
        "admins": [serialize_admin_doc(admin) for admin in admins]
    }

@api_router.post("/admin/admins")
async def create_admin(data: CreateAdminRequest, user: dict = Depends(require_super_admin)):
    """Create new admin account (Super admin only)"""
    # Check if email already exists
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Admin with this email already exists")
    
    # Validate role
    if data.role not in ["super_admin", "admin", "moderator"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Set default permissions based on role
    if data.permissions:
        permissions = data.permissions.dict()
    else:
        permissions = {
            "can_manage_admins": data.role == "super_admin",
            "can_manage_products": True,
            "can_manage_orders": True,
            "can_manage_users": data.role == "super_admin",
            "can_manage_content": True,
            "can_view_analytics": True,
            "can_manage_settings": data.role == "super_admin"
        }
    
    # Create admin document
    admin_doc = {
        "email": data.email.lower(),
        "password_hash": hash_password(data.password),
        "name": data.full_name,
        "role": data.role,
        "is_active": True,
        "permissions": permissions,
        "phone": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.users.insert_one(admin_doc)
    admin_doc["_id"] = result.inserted_id
    
    logger.info(f"New admin created: {data.email} by {user['email']}")
    
    return {
        "success": True,
        "message": "Admin created successfully",
        "admin": serialize_admin_doc(admin_doc)
    }

@api_router.put("/admin/admins/{admin_id}")
async def update_admin(
    admin_id: str, 
    data: UpdateAdminRequest, 
    user: dict = Depends(require_super_admin)
):
    """Update admin account (Super admin only)"""
    admin = await db.users.find_one({"_id": ObjectId(admin_id)})
    
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Prevent updating yourself
    if str(admin["_id"]) == user["sub"]:
        raise HTTPException(status_code=400, detail="Cannot update your own account through this endpoint")
    
    update_data = {}
    
    if data.full_name is not None:
        update_data["name"] = data.full_name
    
    if data.role is not None:
        if data.role not in ["super_admin", "admin", "moderator"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        update_data["role"] = data.role
    
    if data.is_active is not None:
        update_data["is_active"] = data.is_active
    
    if data.permissions is not None:
        update_data["permissions"] = data.permissions.dict()
    
    if data.password is not None:
        if len(data.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        update_data["password_hash"] = hash_password(data.password)
    
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one(
            {"_id": ObjectId(admin_id)},
            {"$set": update_data}
        )
    
    logger.info(f"Admin updated: {admin['email']} by {user['email']}")
    
    return {
        "success": True,
        "message": "Admin updated successfully"
    }

@api_router.patch("/admin/admins/{admin_id}/toggle-status")
async def toggle_admin_status(admin_id: str, user: dict = Depends(require_super_admin)):
    """Activate/Deactivate admin account (Super admin only)"""
    admin = await db.users.find_one({"_id": ObjectId(admin_id)})
    
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Prevent deactivating yourself
    if str(admin["_id"]) == user["sub"]:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    new_status = not admin.get("is_active", True)
    await db.users.update_one(
        {"_id": ObjectId(admin_id)},
        {"$set": {
            "is_active": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    status_text = "activated" if new_status else "deactivated"
    logger.info(f"Admin {status_text}: {admin['email']} by {user['email']}")
    
    return {
        "success": True,
        "message": f"Admin {status_text} successfully"
    }

@api_router.delete("/admin/admins/{admin_id}")
async def delete_admin(admin_id: str, user: dict = Depends(require_super_admin)):
    """Delete admin account (Super admin only)"""
    admin = await db.users.find_one({"_id": ObjectId(admin_id)})
    
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Prevent deleting yourself
    if str(admin["_id"]) == user["sub"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    await db.users.delete_one({"_id": ObjectId(admin_id)})
    
    logger.info(f"Admin deleted: {admin['email']} by {user['email']}")
    
    return {
        "success": True,
        "message": "Admin deleted successfully"
    }

@api_router.get("/admin/profile")
async def get_profile(user: dict = Depends(require_admin)):
    """Get current admin profile"""
    admin = await db.users.find_one({"_id": ObjectId(user["sub"])})
    
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    return {
        "success": True,
        "admin": serialize_admin_doc(admin)
    }

# ─────────────────────────────────────────────────────────────
# ADMIN PROFILE & PASSWORD ROUTES
# ─────────────────────────────────────────────────────────────

@api_router.post("/admin/change-password")
async def change_password(
    data: ChangePasswordRequest,
    user: dict = Depends(require_admin)
):
    """Change admin password"""
    db_user = await db.users.find_one({"_id": ObjectId(user["sub"])})
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(data.currentPassword, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    if len(data.newPassword) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    
    new_hash = hash_password(data.newPassword)
    await db.users.update_one(
        {"_id": ObjectId(user["sub"])},
        {"$set": {
            "password_hash": new_hash,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Password changed successfully"}

@api_router.put("/admin/update-profile")
async def update_profile(
    data: UpdateProfileRequest,
    user: dict = Depends(require_admin)
):
    """Update admin profile information"""
    existing_user = await db.users.find_one({
        "email": data.email.lower(),
        "_id": {"$ne": ObjectId(user["sub"])}
    })
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already in use by another account")
    
    await db.users.update_one(
        {"_id": ObjectId(user["sub"])},
        {"$set": {
            "name": data.name,
            "email": data.email.lower(),
            "phone": data.phone,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Profile updated successfully"}

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
    admins_count = await db.users.count_documents({
        "role": {"$in": ["super_admin", "admin", "moderator"]}
    })
    
    return {
        "contacts": contacts_count,
        "unreadContacts": unread_count,
        "blogPosts": blog_count,
        "events": events_count,
        "upcomingEvents": upcoming_events,
        "admins": admins_count
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
        "version": "2.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# ─────────────────────────────────────────────────────────────
# STARTUP - Migrate existing admin to super admin
# ─────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@heavenlynature.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")

    existing = await db.users.find_one({"email": admin_email})

    if not existing:
        # Create super admin with full permissions
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "super_admin",
            "name": "Super Administrator",
            "phone": "",
            "is_active": True,
            "permissions": {
                "can_manage_admins": True,
                "can_manage_products": True,
                "can_manage_orders": True,
                "can_manage_users": True,
                "can_manage_content": True,
                "can_view_analytics": True,
                "can_manage_settings": True
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Super admin created: {admin_email}")
    else:
        # Update existing admin to super_admin if not already
        if existing.get("role") != "super_admin":
            await db.users.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "role": "super_admin",
                    "name": existing.get("name", "Super Administrator"),
                    "permissions": {
                        "can_manage_admins": True,
                        "can_manage_products": True,
                        "can_manage_orders": True,
                        "can_manage_users": True,
                        "can_manage_content": True,
                        "can_view_analytics": True,
                        "can_manage_settings": True
                    },
                    "is_active": existing.get("is_active", True),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            logger.info(f"Existing admin upgraded to super admin: {admin_email}")
        else:
            logger.info("Super admin already exists")
    
    # Create indexes for better performance
    await db.contacts.create_index("createdAt")
    await db.contacts.create_index("read")
    await db.blog_posts.create_index("publishDate")
    await db.events.create_index("eventDate")
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")
    
    logger.info("Database indexes created")
    logger.info("Server startup complete - Multi-admin support enabled")

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
        "version": "2.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "api": "/api"
    }
