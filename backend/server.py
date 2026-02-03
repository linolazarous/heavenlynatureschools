# backend/server.py
from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import RedirectResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from pathlib import Path
from datetime import datetime, timezone
import uuid
import os
import shutil
import logging
import json

# ==============================
# Load environment variables
# ==============================
from dotenv import load_dotenv
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL', '')
DB_NAME = os.environ.get('DB_NAME', 'heavenlynature')

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
    "https://heavenlynatureschools.netlify.app",
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
# Global DB client & db (set in startup)
# ==============================
client: AsyncIOMotorClient | None = None
db = None

# ==============================
# Models (unchanged)
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
    email: str
    phone: Optional[str] = ""
    subject: str
    message: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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
# API ROOT & HEALTH
# ==============================
@api_router.get("/", tags=["root"])
async def api_root():
    return {
        "message": "Welcome to Heavenly Nature Schools API",
        "version": "1.0.0",
        "database_available": db is not None,
    }

@api_router.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy" if db is not None else "degraded",
        "database": "connected" if db is not None else "unavailable",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "Heavenly Nature Schools API"
    }

# ==============================
# BLOG ENDPOINTS (with DB check)
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

@api_router.get("/blog/{id}", response_model=BlogPost, tags=["blog"])
async def get_blog_post(id: str):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    post = await db.blog.find_one({"id": id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if isinstance(post.get("publishDate"), str):
        post["publishDate"] = datetime.fromisoformat(post["publishDate"])
    return post

# ==============================
# EVENTS ENDPOINTS (example with DB check)
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

@api_router.post("/events", response_model=Event, tags=["events"])
async def create_event(
    title: str = Form(...),
    description: str = Form(...),
    eventDate: str = Form(...),
    location: str = Form(""),
    image: UploadFile = File(None)
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

# (add similar `if db is None` checks to other DB-dependent endpoints: contact, etc.)

# ==============================
# STATIC / MOCK ENDPOINTS (unchanged, no DB needed)
# ==============================
@api_router.get("/governance", response_model=GovernanceData, tags=["governance"])
async def get_governance():
    return { ... }  # your existing data

@api_router.get("/partnerships", tags=["partnerships"])
async def get_partnerships():
    return [ ... ]  # your existing list

@api_router.get("/home/stats", tags=["home"])
async def home_stats():
    return { ... }

@api_router.get("/about", tags=["about"])
async def get_about():
    return { ... }

@api_router.get("/vision", tags=["vision"])
async def get_vision():
    return { ... }

# ==============================
# Include router
# ==============================
app.include_router(api_router)

# ==============================
# Startup & Shutdown
# ==============================
@app.on_event("startup")
async def startup_event():
    global client, db

    logger.info("Starting Heavenly Nature Schools API...")
    logger.info(f"MongoDB URL: {'Set' if MONGO_URL else 'Not set'}")
    logger.info(f"Database name: {DB_NAME}")
    logger.info(f"Upload directory: {UPLOAD_DIR}")

    if not MONGO_URL:
        logger.warning("MONGO_URL not set → running in DB-less mode")
        return

    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]

        # Test connection
        await client.admin.command('ping')
        logger.info("✅ Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}", exc_info=True)
        client = None
        db = None
        # You may choose to raise RuntimeError(...) here if DB is mandatory

@app.on_event("shutdown")
async def shutdown_db_client():
    global client
    if client:
        logger.info("Closing MongoDB connection...")
        client.close()
        logger.info("MongoDB connection closed.")
        client = None
        db = None

# ==============================
# Root redirect and static files
# ==============================
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

# Mount static & uploads if directories exist
static_dir = ROOT_DIR / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

if UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ==============================
# Logging setup
# ==============================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)
logger.info(f"CORS allowed origins: {cors_origins}")

# ==============================
# Optional: 404 handler with helpful info
# ==============================
@app.exception_handler(404)
async def not_found_exception_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Not Found",
            "message": f"The requested URL {request.url} was not found.",
            "hint": "Check /api/ for available endpoints"
        }
    )
