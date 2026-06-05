# backend/server.py
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, Request, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import logging
import bcrypt
import jwt
import uuid
import aiofiles
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MIN = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Upload configuration
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "uploads"))
BLOG_IMAGES_DIR = UPLOAD_DIR / "blog-images"
EVENT_IMAGES_DIR = UPLOAD_DIR / "event-images"
ID_PHOTOS_DIR = UPLOAD_DIR / "id-photos"
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}

# Create upload directories if they don't exist
BLOG_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
EVENT_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
ID_PHOTOS_DIR.mkdir(parents=True, exist_ok=True)

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
    doc.pop("password_hash", None)
    return doc

def serialize_admin_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password_hash", None)
    return doc

def validate_image(file: UploadFile) -> None:
    """Validate uploaded image file type."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' is not allowed. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

async def save_upload_file(file: UploadFile, directory: Path) -> str:
    """Save uploaded file and return the URL path."""
    file_ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = directory / unique_filename

    content = await file.read()

    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    relative_path = file_path.relative_to(UPLOAD_DIR)
    return f"/uploads/{relative_path}"

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
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

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
    if user.get("role") not in ["super_admin", "admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_user = await db.users.find_one({"_id": ObjectId(user["sub"])})
    if not db_user or not db_user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    return user

async def require_super_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
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
    role: str = "admin"
    permissions: Optional[AdminPermissions] = None

class UpdateAdminRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    permissions: Optional[AdminPermissions] = None
    password: Optional[str] = None

# ✅ Live Chat Models
class ChatMessage(BaseModel):
    message: str
    username: Optional[str] = "Guest"

# ─────────────────────────────────────────────────────────────
# IMAGE UPLOAD ROUTES
# ─────────────────────────────────────────────────────────────

@api_router.post("/upload")
async def upload_image(
    image: UploadFile = File(...),
    user: dict = Depends(require_admin)
):
    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="No image file provided")

    validate_image(image)
    image_url = await save_upload_file(image, BLOG_IMAGES_DIR)

    logger.info(f"Image uploaded by {user.get('email')}: {image_url}")

    return {
        "url": image_url,
        "imageUrl": image_url,
        "message": "Image uploaded successfully"
    }

@api_router.post("/upload/blog-image")
async def upload_blog_image(
    image: UploadFile = File(...),
    user: dict = Depends(require_admin)
):
    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="No image file provided")

    validate_image(image)
    image_url = await save_upload_file(image, BLOG_IMAGES_DIR)

    logger.info(f"Blog image uploaded by {user.get('email')}: {image_url}")

    return {
        "url": image_url,
        "imageUrl": image_url,
        "message": "Blog image uploaded successfully"
    }

@api_router.post("/upload/event-image")
async def upload_event_image(
    image: UploadFile = File(...),
    user: dict = Depends(require_admin)
):
    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="No image file provided")

    validate_image(image)
    image_url = await save_upload_file(image, EVENT_IMAGES_DIR)

    logger.info(f"Event image uploaded by {user.get('email')}: {image_url}")

    return {
        "url": image_url,
        "imageUrl": image_url,
        "message": "Event image uploaded successfully"
    }

# ─────────────────────────────────────────────────────────────
# ID CARD HELPERS
# ─────────────────────────────────────────────────────────────

ROLE_CODE_MAP = {
    "School Director": "SD",
    "School Officer": "SO",
    "Director of Studies": "DS",
    "School Bursar": "SB",
    "Principal": "PR",
    "Head Teacher": "HT",
    "Senior Woman Teacher": "SW",
    "Senior Man Teacher": "SM",
    "Teacher": "ED",
    "Sports Teacher": "ST",
    "Debate Teacher": "DT",
    "School Coordinator": "SC",
    "Admin": "AD",
    "Accountant": "AC",
    "Secretary": "SE",
    "Office Staff": "OS",
    "Staff": "SF",
    "Caregiver": "CG",
    "Social Worker": "SWK",
    "Nurse": "NR",
    "Librarian": "LB",
    "Counselor": "CL",
    "Security": "SP",
    "Guard": "GD",
    "Volunteer": "VL",
    "Intern": "IN",
    "Head Prefect": "HP",
    "Assistant Head Prefect": "AH",
    "Health Prefect": "HL",
    "Debate Prefect": "DP",
    "Sports Prefect": "SPR",
    "Class Prefect": "CP",
    "Prefect": "PF",
    "Student": "STU",
    "Pupil": "PUP",
    "Learner": "LRN",
}

def _get_role_code(role: str) -> str:
    return ROLE_CODE_MAP.get(role, "CM")

def _is_student_role(role: str) -> bool:
    student_roles = [
        "Head Prefect", "Assistant Head Prefect", "Health Prefect", "Debate Prefect",
        "Sports Prefect", "Class Prefect", "Prefect", "Student", "Pupil", "Learner",
    ]
    return role in student_roles

def _calculate_expiry(role: str) -> str:
    years = 1 if _is_student_role(role) else 3
    expiry = datetime.now(timezone.utc).replace(year=datetime.now(timezone.utc).year + years)
    return expiry.strftime("%Y-%m-%d")

async def _generate_member_id(db, role_code: str) -> str:
    year = datetime.now(timezone.utc).strftime("%Y")
    pattern = f"HNM-{role_code}-{year}-"
    count = await db.id_cards.count_documents({"member_id": {"$regex": f"^{pattern}"}})
    return f"{pattern}{str(count + 1).zfill(3)}"

# ─────────────────────────────────────────────────────────────
# ID CARD ROUTES
# ─────────────────────────────────────────────────────────────

@api_router.post("/admin/id-cards")
async def upload_id_card(
    name: str = Form(...),
    image: UploadFile = File(...),
    photo: UploadFile = File(None),
    role: str = Form("Teacher"),
    department: str = Form(None),
    member_id: str = Form(None),
    date_of_birth: str = Form(None),
    gender: str = Form(None),
    blood_group: str = Form(None),
    phone: str = Form(None),
    branch: str = Form("Juba Main Campus"),
    member_since: str = Form(None),
    emergency_contact_name: str = Form(None),
    emergency_contact_phone: str = Form(None),
    emergency_contact_relation: str = Form(None),
    date_issued: str = Form(None),
    expiry_date: str = Form(None),
    is_active: bool = Form(True),
    user: dict = Depends(require_admin),
):
    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="Front ID image is required")

    if role not in ROLE_CODE_MAP:
        logger.warning(f"Unknown role '{role}' - using default code 'CM'")

    role_code = _get_role_code(role)
    if not member_id:
        member_id = await _generate_member_id(db, role_code)
    if not expiry_date:
        expiry_date = _calculate_expiry(role)

    file_id = str(uuid.uuid4())

    front_id_url = await save_upload_file(image, ID_PHOTOS_DIR)

    passport_photo_url = None
    if photo and photo.filename:
        passport_photo_url = await save_upload_file(photo, ID_PHOTOS_DIR)

    id_card = {
        "id": file_id,
        "name": name.strip(),
        "member_id": member_id,
        "role_code": role_code,
        "image_url": front_id_url,
        "photo_url": passport_photo_url or front_id_url,
        "role": role,
        "department": department,
        "branch": branch,
        "date_of_birth": date_of_birth,
        "gender": gender,
        "blood_group": blood_group,
        "phone": phone,
        "member_since": member_since,
        "emergency_contact_name": emergency_contact_name,
        "emergency_contact_phone": emergency_contact_phone,
        "emergency_contact_relation": emergency_contact_relation,
        "date_issued": date_issued or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "expiry_date": expiry_date,
        "is_active": is_active,
        "verify_url": f"https://heavenlynatureschools.com/verify/{file_id}",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user.get("email", "unknown"),
    }
    await db.id_cards.insert_one(id_card)

    logger.info(f"ID Card created: {member_id} ({role}) by {user.get('email')}")

    return {
        "id": file_id,
        "name": name,
        "member_id": member_id,
        "role_code": role_code,
        "role": role,
        "photo_url": passport_photo_url or front_id_url,
        "verify_url": f"https://heavenlynatureschools.com/verify/{file_id}",
        "expiry_date": expiry_date,
        "message": "ID card created successfully."
    }

@api_router.get("/admin/id-cards")
async def list_id_cards(
    search: str = Query(None),
    role: str = Query(None),
    department: str = Query(None),
    is_active: bool = Query(None),
    limit: int = Query(100, le=500),
    skip: int = 0,
    user: dict = Depends(require_admin),
):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"member_id": {"$regex": search, "$options": "i"}}
        ]
    if role:
        query["role"] = role
    if department:
        query["department"] = department
    if is_active is not None:
        query["is_active"] = is_active

    cards = await db.id_cards.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    for c in cards:
        c.pop("_id", None)

    total = await db.id_cards.count_documents(query)
    return {"id_cards": cards, "total": total}

@api_router.delete("/admin/id-cards/{card_id}")
async def delete_id_card(card_id: str, user: dict = Depends(require_admin)):
    result = await db.id_cards.delete_one({"id": card_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="ID card not found")
    logger.info(f"ID Card deleted: {card_id} by {user.get('email')}")
    return {"message": "ID card deleted"}

@api_router.get("/verify/{card_id}")
async def verify_id_card(card_id: str):
    card = await db.id_cards.find_one({"id": card_id})

    if not card:
        try:
            card = await db.id_cards.find_one({"_id": ObjectId(card_id)})
        except:
            pass

    if not card:
        return JSONResponse(
            status_code=404,
            content={
                "valid": False,
                "message": "ID not found. Please contact the school administration office."
            }
        )

    card.pop("_id", None)
    card.pop("created_by", None)

    is_expired = False
    expiry_date = card.get("expiry_date")
    if expiry_date:
        try:
            expiry = datetime.strptime(expiry_date, "%Y-%m-%d")
            is_expired = expiry < datetime.now(timezone.utc)
        except:
            expiry_date = None

    is_active = card.get("is_active", True)

    if not is_active or is_expired:
        return {
            "valid": False,
            "message": "ID expired or inactive. Please contact the school administration office.",
            "member": {
                "name": card.get("name"),
                "member_id": card.get("member_id"),
                "role": card.get("role"),
                "status": "expired" if is_expired else "inactive"
            }
        }

    return {
        "valid": True,
        "member": {
            "name": card.get("name"),
            "member_id": card.get("member_id"),
            "role": card.get("role"),
            "role_code": card.get("role_code"),
            "department": card.get("department"),
            "photo_url": card.get("photo_url"),
            "image_url": card.get("image_url"),
            "expiry_date": card.get("expiry_date"),
            "branch": card.get("branch"),
            "verified_at": datetime.now(timezone.utc).isoformat()
        }
    }

@api_router.get("/admin/roles")
async def get_available_roles(user: dict = Depends(require_admin)):
    staff_roles = [
        "School Director", "School Officer", "Director of Studies", "School Bursar",
        "Principal", "Head Teacher", "Senior Woman Teacher", "Senior Man Teacher",
        "Teacher", "Sports Teacher", "Debate Teacher", "School Coordinator",
        "Admin", "Accountant", "Secretary", "Office Staff",
        "Caregiver", "Social Worker", "Nurse", "Librarian", "Counselor",
        "Security", "Guard", "Volunteer", "Intern", "Staff",
    ]
    student_roles = [
        "Head Prefect", "Assistant Head Prefect", "Health Prefect", "Debate Prefect",
        "Sports Prefect", "Class Prefect", "Prefect", "Student", "Pupil", "Learner",
    ]
    return {
        "staff_roles": staff_roles,
        "student_roles": student_roles,
        "all_roles": staff_roles + student_roles
    }

# ─────────────────────────────────────────────────────────────
# LIVE CHAT ROUTES
# ─────────────────────────────────────────────────────────────

@api_router.post("/live-chat/send")
async def send_chat_message(data: ChatMessage, request: Request):
    """
    Send a chat message. Public endpoint - works without authentication.
    Auto-detects admin status from JWT token if present.
    """
    username = data.username or "Guest"
    is_admin = False

    # Try to detect admin from token
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            if payload.get("type") == "access":
                username = payload.get("name", username)
                is_admin = payload.get("role") in ["super_admin", "admin", "moderator"]
    except:
        pass  # Guest user - no token or invalid token

    message_doc = {
        "username": username,
        "message": data.message.strip(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "is_admin": is_admin,
        "source": "website",
    }

    result = await db.chat_messages.insert_one(message_doc)
    message_doc["id"] = str(result.inserted_id)

    # Keep only last 500 messages to prevent DB bloat
    count = await db.chat_messages.count_documents({})
    if count > 500:
        oldest = await db.chat_messages.find({}).sort("timestamp", 1).limit(count - 500).to_list(count - 500)
        if oldest:
            old_ids = [o["_id"] for o in oldest]
            await db.chat_messages.delete_many({"_id": {"$in": old_ids}})

    logger.info(f"Chat message from {username}: {data.message[:50]}...")

    return {
        "success": True,
        "message": {
            "id": message_doc["id"],
            "username": username,
            "message": data.message.strip(),
            "timestamp": message_doc["timestamp"],
            "is_admin": is_admin,
            "source": "website",
        }
    }

@api_router.get("/live-chat/messages")
async def get_chat_messages(
    limit: int = Query(50, le=200),
    before: str = Query(None),
):
    """
    Get recent chat messages. Public endpoint.
    """
    query = {}
    if before:
        query["timestamp"] = {"$lt": before}

    messages = await db.chat_messages.find(query).sort("timestamp", -1).limit(limit).to_list(limit)
    messages.reverse()  # Show oldest first

    # Count online users (active in last 5 minutes)
    five_min_ago = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
    online_users = await db.chat_messages.distinct("username", {"timestamp": {"$gte": five_min_ago}})
    online_count = len(online_users)

    result = []
    for msg in messages:
        msg["id"] = str(msg.pop("_id"))
        result.append(msg)

    return {
        "messages": result,
        "online_count": online_count,
        "total": len(result),
    }

@api_router.delete("/live-chat/messages/{message_id}")
async def delete_chat_message(
    message_id: str,
    user: dict = Depends(require_admin)
):
    """
    Delete a chat message. Admin only.
    """
    try:
        result = await db.chat_messages.delete_one({"_id": ObjectId(message_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Message not found")

        logger.info(f"Chat message {message_id} deleted by {user.get('email')}")
        return {"success": True, "message": "Message deleted"}
    except HTTPException:
        raise
    except:
        raise HTTPException(status_code=404, detail="Invalid message ID")

@api_router.get("/live-chat/online")
async def get_online_count():
    """
    Get count of online users (active in last 5 minutes).
    """
    five_min_ago = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
    online_users = await db.chat_messages.distinct("username", {"timestamp": {"$gte": five_min_ago}})

    return {
        "online_count": len(online_users),
        "users": online_users[:20],
    }

@api_router.get("/live-chat/stats")
async def get_chat_stats(user: dict = Depends(require_admin)):
    """
    Get chat statistics. Admin only.
    """
    total_messages = await db.chat_messages.count_documents({})

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    today_messages = await db.chat_messages.count_documents({"timestamp": {"$gte": today_start}})

    five_min_ago = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
    online_now = len(await db.chat_messages.distinct("username", {"timestamp": {"$gte": five_min_ago}}))

    unique_users_today = len(await db.chat_messages.distinct("username", {"timestamp": {"$gte": today_start}}))

    return {
        "total_messages": total_messages,
        "today_messages": today_messages,
        "online_now": online_now,
        "unique_users_today": unique_users_today,
    }

# ─────────────────────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────────────────────

@api_router.post("/auth/login")
async def login(data: LoginRequest):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account has been deactivated")

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )

    permissions = user.get("permissions", {})
    if not permissions and user.get("role") == "super_admin":
        permissions = {
            "can_manage_admins": True, "can_manage_products": True,
            "can_manage_orders": True, "can_manage_users": True,
            "can_manage_content": True, "can_view_analytics": True,
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
    return {"access_token": create_access_token(user)}

@api_router.post("/auth/logout")
async def logout(user: dict = Depends(require_admin)):
    return {"message": "Logged out"}

# ─────────────────────────────────────────────────────────────
# ADMIN MANAGEMENT
# ─────────────────────────────────────────────────────────────

@api_router.get("/admin/admins")
async def get_all_admins(user: dict = Depends(require_super_admin)):
    admins = await db.users.find(
        {"role": {"$in": ["super_admin", "admin", "moderator"]}}
    ).sort("created_at", -1).to_list(100)
    return {"success": True, "admins": [serialize_admin_doc(a) for a in admins]}

@api_router.post("/admin/admins")
async def create_admin(data: CreateAdminRequest, user: dict = Depends(require_super_admin)):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Admin with this email already exists")
    if data.role not in ["super_admin", "admin", "moderator"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    permissions = data.permissions.dict() if data.permissions else {
        "can_manage_admins": data.role == "super_admin",
        "can_manage_products": True,
        "can_manage_orders": True,
        "can_manage_users": data.role == "super_admin",
        "can_manage_content": True,
        "can_view_analytics": True,
        "can_manage_settings": data.role == "super_admin"
    }

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
    return {"success": True, "message": "Admin created", "admin": serialize_admin_doc(admin_doc)}

@api_router.put("/admin/admins/{admin_id}")
async def update_admin(admin_id: str, data: UpdateAdminRequest, user: dict = Depends(require_super_admin)):
    admin = await db.users.find_one({"_id": ObjectId(admin_id)})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if str(admin["_id"]) == user["sub"]:
        raise HTTPException(status_code=400, detail="Cannot update yourself")

    update_data = {}
    if data.full_name is not None:
        update_data["name"] = data.full_name
    if data.role is not None:
        update_data["role"] = data.role
    if data.is_active is not None:
        update_data["is_active"] = data.is_active
    if data.permissions is not None:
        update_data["permissions"] = data.permissions.dict()
    if data.password:
        update_data["password_hash"] = hash_password(data.password)

    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"_id": ObjectId(admin_id)}, {"$set": update_data})

    return {"success": True, "message": "Admin updated"}

@api_router.patch("/admin/admins/{admin_id}/toggle-status")
async def toggle_admin_status(admin_id: str, user: dict = Depends(require_super_admin)):
    admin = await db.users.find_one({"_id": ObjectId(admin_id)})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if str(admin["_id"]) == user["sub"]:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    new_status = not admin.get("is_active", True)
    await db.users.update_one(
        {"_id": ObjectId(admin_id)},
        {"$set": {"is_active": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True, "message": f"Admin {'activated' if new_status else 'deactivated'}"}

@api_router.delete("/admin/admins/{admin_id}")
async def delete_admin(admin_id: str, user: dict = Depends(require_super_admin)):
    admin = await db.users.find_one({"_id": ObjectId(admin_id)})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if str(admin["_id"]) == user["sub"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    await db.users.delete_one({"_id": ObjectId(admin_id)})
    return {"success": True, "message": "Admin deleted"}

@api_router.get("/admin/profile")
async def get_profile(user: dict = Depends(require_admin)):
    admin = await db.users.find_one({"_id": ObjectId(user["sub"])})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"success": True, "admin": serialize_admin_doc(admin)}

@api_router.post("/admin/change-password")
async def change_password(data: ChangePasswordRequest, user: dict = Depends(require_admin)):
    db_user = await db.users.find_one({"_id": ObjectId(user["sub"])})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(data.currentPassword, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    if len(data.newPassword) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    await db.users.update_one(
        {"_id": ObjectId(user["sub"])},
        {"$set": {
            "password_hash": hash_password(data.newPassword),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Password changed"}

@api_router.put("/admin/update-profile")
async def update_profile(data: UpdateProfileRequest, user: dict = Depends(require_admin)):
    existing = await db.users.find_one({
        "email": data.email.lower(),
        "_id": {"$ne": ObjectId(user["sub"])}
    })
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    await db.users.update_one(
        {"_id": ObjectId(user["sub"])},
        {"$set": {
            "name": data.name,
            "email": data.email.lower(),
            "phone": data.phone,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Profile updated"}

# ─────────────────────────────────────────────────────────────
# CONTACT ROUTES
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

@api_router.patch("/admin/contacts/{contact_id}")
async def update_contact(contact_id: str, data: ContactUpdate, user=Depends(require_admin)):
    result = await db.contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": {"read": data.read}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact updated"}

@api_router.delete("/admin/contacts/{contact_id}")
async def delete_contact(contact_id: str, user=Depends(require_admin)):
    result = await db.contacts.delete_one({"_id": ObjectId(contact_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact deleted"}

# ─────────────────────────────────────────────────────────────
# BLOG ROUTES
# ─────────────────────────────────────────────────────────────

@api_router.get("/blog")
async def get_blog_posts():
    posts = await db.blog_posts.find({}).sort("publishDate", -1).to_list(1000)
    return [serialize_doc(p) for p in posts]

@api_router.get("/blog/{post_id}")
async def get_blog_post(post_id: str):
    try:
        post = await db.blog_posts.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return serialize_doc(post)

@api_router.post("/admin/blog")
async def create_blog_post(data: BlogPostCreate, user=Depends(require_admin)):
    doc = data.model_dump()
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.blog_posts.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Blog created"}

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
    return {"message": "Blog updated"}

@api_router.delete("/admin/blog/{post_id}")
async def delete_blog_post(post_id: str, user=Depends(require_admin)):
    result = await db.blog_posts.delete_one({"_id": ObjectId(post_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"message": "Blog deleted"}

# ─────────────────────────────────────────────────────────────
# EVENT ROUTES
# ─────────────────────────────────────────────────────────────

@api_router.get("/events")
async def get_events():
    events = await db.events.find({}).sort("eventDate", 1).to_list(1000)
    return [serialize_doc(e) for e in events]

@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    try:
        event = await db.events.find_one({"_id": ObjectId(event_id)})
    except:
        raise HTTPException(status_code=404, detail="Event not found")
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return serialize_doc(event)

@api_router.post("/admin/events")
async def create_event(data: EventCreate, user=Depends(require_admin)):
    doc = data.model_dump()
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.events.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Event created"}

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
    return {"message": "Event updated"}

@api_router.delete("/admin/events/{event_id}")
async def delete_event(event_id: str, user=Depends(require_admin)):
    result = await db.events.delete_one({"_id": ObjectId(event_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}

# ─────────────────────────────────────────────────────────────
# STATS, SETTINGS, HEALTH
# ─────────────────────────────────────────────────────────────

@api_router.get("/admin/stats")
async def get_admin_stats(user=Depends(require_admin)):
    return {
        "contacts": await db.contacts.count_documents({}),
        "unreadContacts": await db.contacts.count_documents({"read": False}),
        "blogPosts": await db.blog_posts.count_documents({}),
        "events": await db.events.count_documents({}),
        "upcomingEvents": await db.events.count_documents(
            {"eventDate": {"$gte": datetime.now(timezone.utc).isoformat()}}
        ),
        "admins": await db.users.count_documents(
            {"role": {"$in": ["super_admin", "admin", "moderator"]}}
        ),
        "idCards": await db.id_cards.count_documents({}),
        "chatMessages": await db.chat_messages.count_documents({}),
    }

@api_router.get("/admin/settings")
async def get_settings(user=Depends(require_admin)):
    settings = await db.settings.find_one({"_id": "admin_settings"})
    return AdminSettings().dict() if not settings else {k: v for k, v in settings.items() if k != "_id"}

@api_router.post("/admin/settings")
async def save_settings(data: AdminSettings, user=Depends(require_admin)):
    await db.settings.update_one(
        {"_id": "admin_settings"},
        {"$set": data.dict()},
        upsert=True
    )
    return {"message": "Settings saved"}

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
# STARTUP
# ─────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    # Create directories
    BLOG_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    EVENT_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    ID_PHOTOS_DIR.mkdir(parents=True, exist_ok=True)

    # Create default admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@heavenlynature.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
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
    elif existing.get("role") != "super_admin":
        await db.users.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "role": "super_admin",
                "permissions": {
                    "can_manage_admins": True,
                    "can_manage_products": True,
                    "can_manage_orders": True,
                    "can_manage_users": True,
                    "can_manage_content": True,
                    "can_view_analytics": True,
                    "can_manage_settings": True
                },
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )

    # Create indexes
    await db.contacts.create_index("createdAt")
    await db.blog_posts.create_index("publishDate")
    await db.events.create_index("eventDate")
    await db.users.create_index("email", unique=True)
    await db.id_cards.create_index("id")
    await db.id_cards.create_index("member_id")
    await db.chat_messages.create_index("timestamp")
    await db.chat_messages.create_index([("timestamp", -1)])

    logger.info("✅ School API startup complete - Live Chat, ID Cards, Blog, Events, Image Upload enabled")

# ─────────────────────────────────────────────────────────────
# CORS, STATIC FILES, ROUTER
# ─────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.include_router(api_router)

@app.get("/")
async def root_redirect():
    return {
        "message": "Heavenly Nature Schools API",
        "version": "2.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "api": "/api"
    }
