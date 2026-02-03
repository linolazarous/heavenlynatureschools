# backend/server.py
from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.responses import RedirectResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Annotated
from pathlib import Path
from datetime import datetime, timezone, timedelta
import uuid
import os
import shutil
import logging
from jose import JWTError, jwt
from passlib.context import CryptContext

# ==============================
# Load environment variables
# ==============================
from dotenv import load_dotenv
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL', '')
DB_NAME = os.environ.get('DB_NAME', 'heavenlynature')
SECRET_KEY = os.environ.get("SECRET_KEY")  # Required – generate strong key!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not SECRET_KEY:
    raise ValueError("SECRET_KEY must be set in .env")

# ==============================
# Initialize FastAPI
# ==============================
app = FastAPI(
    title="Heavenly Nature Schools API",
    description="Backend API for Heavenly Nature Schools Frontend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

api_router = APIRouter(prefix="/api")

# ==============================
# CORS Middleware
# ==============================
cors_origins = [
    "https://heavenlynatureschool.netlify.app",
    "https://heavenlynatureschools.com",
    "https://www.heavenlynatureschools.com",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Global DB client & db
# ==============================
client: AsyncIOMotorClient | None = None
db = None

# ==============================
# Password hashing
# ==============================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# ==============================
# JWT utilities
# ==============================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

# ==============================
# Models
# ==============================
class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    excerpt: str
    content: Optional[str] = ""
    imageUrl: Optional[str] = ""
    publishDate: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    readTime: Optional[str] = "5 min read"

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    eventDate: datetime
    location: Optional[str] = ""
    imageUrl: Optional[str] = ""

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    subject: str
    message: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Governance models (static data – no DB for now)
class GovernanceBoard(BaseModel):
    description: str
    responsibilities: List[str]

class GovernanceManagement(BaseModel):
    description: str
    functions: List[str]

class GovernanceHead(BaseModel):
    description: str
    responsibilities: List[str]

class GovernanceData(BaseModel):
    intro: dict
    board: GovernanceBoard
    management: GovernanceManagement
    headTeacher: GovernanceHead

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: EmailStr
    hashed_password: str
    is_admin: bool = True

# ==============================
# Utility: Save uploaded file
# ==============================
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

async def save_upload_file(file: UploadFile | None) -> str:
    if not file:
        return ""
    file_ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"/uploads/{filename}"

# ==============================
# AUTH: Login
# ==============================
@api_router.post("/login", response_model=Token, tags=["auth"])
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ==============================
# STATS (for dashboard)
# ==============================
@api_router.get("/stats", tags=["admin"])
async def get_stats(current_user: Annotated[dict, Depends(get_current_user)]):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    return {
        "contacts": await db.contacts.count_documents({}),
        "blogPosts": await db.blog.count_documents({}),
        "events": await db.events.count_documents({})
    }

# ==============================
# CONTACTS
# ==============================
@api_router.post("/contacts", response_model=ContactMessage, status_code=201, tags=["contacts"])
async def create_contact(
    name: str = Form(...),
    email: EmailStr = Form(...),
    phone: Optional[str] = Form(None),
    subject: str = Form(...),
    message: str = Form(...)
):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    
    contact = ContactMessage(name=name, email=email, phone=phone, subject=subject, message=message)
    doc = contact.model_dump()
    doc["date"] = doc["date"].isoformat()
    result = await db.contacts.insert_one(doc)
    contact.id = str(result.inserted_id)
    return contact

@api_router.get("/contacts", response_model=List[ContactMessage], tags=["contacts"])
async def get_contacts(current_user: Annotated[dict, Depends(get_current_user)]):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    cursor = db.contacts.find().sort("date", -1)
    contacts = await cursor.to_list(length=1000)
    for c in contacts:
        c["id"] = str(c["_id"])
        del c["_id"]
        if isinstance(c.get("date"), str):
            c["date"] = datetime.fromisoformat(c["date"])
    return contacts

@api_router.delete("/contacts/{contact_id}", status_code=204, tags=["contacts"])
async def delete_contact(contact_id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    result = await db.contacts.delete_one({"_id": uuid.UUID(contact_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return None

# ==============================
# BLOG CRUD
# ==============================
@api_router.get("/blog", response_model=List[BlogPost], tags=["blog"])
async def get_blog_posts():
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    posts = await db.blog.find({}, {"_id": 0}).to_list(1000)
    for p in posts:
        if isinstance(p.get("publishDate"), str):
            p["publishDate"] = datetime.fromisoformat(p["publishDate"])
    return posts

@api_router.post("/blog", response_model=BlogPost, status_code=201, tags=["blog"])
async def create_blog_post(post: BlogPost, current_user: Annotated[dict, Depends(get_current_user)]):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    doc = post.model_dump()
    doc["publishDate"] = doc["publishDate"].isoformat()
    await db.blog.insert_one(doc)
    return post

@api_router.put("/blog/{post_id}", response_model=BlogPost, tags=["blog"])
async def update_blog_post(post_id: str, post: BlogPost, current_user: Annotated[dict, Depends(get_current_user)]):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    update_data = post.model_dump(exclude_unset=True)
    if "publishDate" in update_data:
        update_data["publishDate"] = update_data["publishDate"].isoformat()
    result = await db.blog.update_one({"id": post_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(404, detail="Blog post not found")
    updated = await db.blog.find_one({"id": post_id}, {"_id": 0})
    if isinstance(updated.get("publishDate"), str):
        updated["publishDate"] = datetime.fromisoformat(updated["publishDate"])
    return updated

@api_router.delete("/blog/{post_id}", status_code=204, tags=["blog"])
async def delete_blog_post(post_id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    result = await db.blog.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(404, detail="Blog post not found")
    return None

# ==============================
# EVENTS CRUD
# ==============================
@api_router.get("/events", response_model=List[Event], tags=["events"])
async def get_events():
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    events = await db.events.find({}, {"_id": 0}).to_list(1000)
    for e in events:
        if isinstance(e.get("eventDate"), str):
            e["eventDate"] = datetime.fromisoformat(e["eventDate"])
    return events

@api_router.post("/events", response_model=Event, status_code=201, tags=["events"])
async def create_event(
    title: str = Form(...),
    description: str = Form(...),
    eventDate: str = Form(...),
    location: str = Form(""),
    image: UploadFile = File(None),
    current_user: Annotated[dict, Depends(get_current_user)] = None
):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    imageUrl = await save_upload_file(image)
    event = Event(
        title=title,
        description=description,
        eventDate=datetime.fromisoformat(eventDate),
        location=location,
        imageUrl=imageUrl
    )
    doc = event.model_dump()
    doc["eventDate"] = doc["eventDate"].isoformat()
    await db.events.insert_one(doc)
    return event

@api_router.put("/events/{event_id}", response_model=Event, tags=["events"])
async def update_event(event_id: str, event: Event, current_user: Annotated[dict, Depends(get_current_user)]):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    update_data = event.model_dump(exclude_unset=True)
    if "eventDate" in update_data:
        update_data["eventDate"] = update_data["eventDate"].isoformat()
    result = await db.events.update_one({"id": event_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(404, detail="Event not found")
    updated = await db.events.find_one({"id": event_id}, {"_id": 0})
    if isinstance(updated.get("eventDate"), str):
        updated["eventDate"] = datetime.fromisoformat(updated["eventDate"])
    return updated

@api_router.delete("/events/{event_id}", status_code=204, tags=["events"])
async def delete_event(event_id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(404, detail="Event not found")
    return None

# ==============================
# Static / Mock Endpoints (unchanged)
# ==============================
@api_router.get("/governance", response_model=GovernanceData, tags=["governance"])
async def get_governance():
    # Your static data here
    return {
        "intro": {"text": "Governance intro..."},
        "board": {"description": "...", "responsibilities": []},
        "management": {"description": "...", "functions": []},
        "headTeacher": {"description": "...", "responsibilities": []}
    }

# Include router
app.include_router(api_router)

# ==============================
# Startup & Shutdown
# ==============================
@app.on_event("startup")
async def startup_event():
    global client, db
    logging.info("Starting Heavenly Nature Schools API...")
    if not MONGO_URL:
        logging.warning("MONGO_URL not set → running in DB-less mode")
        return
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        await client.admin.command('ping')
        logging.info("✅ Successfully connected to MongoDB")
    except Exception as e:
        logging.error(f"❌ MongoDB connection failed: {e}", exc_info=True)
        client = None
        db = None

@app.on_event("shutdown")
async def shutdown_db_client():
    global client
    if client:
        logging.info("Closing MongoDB connection...")
        client.close()
        client = None
        db = None

# Root redirect, static files, logging, 404 (unchanged from your version)
@app.get("/", include_in_schema=False)
async def root_redirect():
    return RedirectResponse(url="/api/")

@app.get("/health", include_in_schema=False)
async def root_health():
    return JSONResponse(
        content={
            "status": "healthy" if db is not None else "degraded",
            "service": "Heavenly Nature Schools API",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        status_code=200
    )

static_dir = ROOT_DIR / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

if UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)
logger.info(f"CORS allowed origins: {cors_origins}")
logger.info("Server configured with JWT auth")
