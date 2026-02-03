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
)

api_router = APIRouter(prefix="/api")

# ==============================
# CORS Middleware - MUST BE BEFORE ANY ROUTES
# ==============================
cors_origins = [
    "https://heavenlynatureschools.netlify.app",
    "https://heavenlynatureschools.com",
    "https://www.heavenlynatureschools.com",
    "http://localhost:3000",
    "http://localhost:5173",  # Vite dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

async def save_upload_file(file: UploadFile) -> str:
    file_ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"/uploads/{filename}"

# ==============================
# API ROOT ENDPOINTS (for testing/debugging)
# ==============================
@api_router.get("/", tags=["root"])
async def api_root():
    """API root endpoint"""
    return {
        "message": "Welcome to Heavenly Nature Schools API",
        "version": "1.0.0",
        "endpoints": {
            "blog": "/api/blog",
            "events": "/api/events",
            "contact": "/api/contact",
            "governance": "/api/governance",
            "partnerships": "/api/partnerships",
            "stats": "/api/home/stats",
            "about": "/api/about",
            "vision": "/api/vision",
            "health": "/api/health"
        }
    }

@api_router.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "Heavenly Nature Schools API"
    }

# ==============================
# BLOG ENDPOINTS
# ==============================
@api_router.get("/blog", response_model=List[BlogPost], tags=["blog"])
async def get_blog_posts():
    posts = await db.blog.find({}, {"_id": 0}).to_list(1000)
    for p in posts:
        if isinstance(p.get("publishDate"), str):
            p["publishDate"] = datetime.fromisoformat(p["publishDate"])
    return posts

@api_router.get("/blog/{id}", response_model=BlogPost, tags=["blog"])
async def get_blog_post(id: str):
    post = await db.blog.find_one({"id": id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if isinstance(post.get("publishDate"), str):
        post["publishDate"] = datetime.fromisoformat(post["publishDate"])
    return post

# ==============================
# EVENTS ENDPOINTS
# ==============================
@api_router.get("/events", response_model=List[Event], tags=["events"])
async def get_events():
    events = await db.events.find({}, {"_id": 0}).to_list(1000)
    for e in events:
        if isinstance(e.get("eventDate"), str):
            e["eventDate"] = datetime.fromisoformat(e["eventDate"])
    return events

@api_router.get("/events/{id}", response_model=Event, tags=["events"])
async def get_event(id: str):
    event = await db.events.find_one({"id": id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if isinstance(event.get("eventDate"), str):
        event["eventDate"] = datetime.fromisoformat(event["eventDate"])
    return event

@api_router.post("/events", response_model=Event, tags=["events"])
async def create_event(
    title: str = Form(...),
    description: str = Form(...),
    eventDate: str = Form(...),
    location: str = Form(""),
    image: UploadFile = File(None)
):
    imageUrl = await save_upload_file(image) if image else ""
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

# ==============================
# CONTACT ENDPOINTS
# ==============================
@api_router.post("/contact", response_model=ContactMessage, tags=["contact"])
async def create_contact(contact: ContactMessage):
    doc = contact.model_dump()
    doc["date"] = doc["date"].isoformat()
    await db.contacts.insert_one(doc)
    return contact

@api_router.get("/contact", response_model=List[ContactMessage], tags=["contact"])
async def get_contacts():
    contacts = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    for c in contacts:
        if isinstance(c.get("date"), str):
            c["date"] = datetime.fromisoformat(c["date"])
    return contacts

# ==============================
# GOVERNANCE ENDPOINT
# ==============================
@api_router.get("/governance", response_model=GovernanceData, tags=["governance"])
async def get_governance():
    return {
        "intro": {
            "title": "Governance & Leadership",
            "subtitle": "Transparent, accountable leadership guiding our mission"
        },
        "board": {
            "description": "Our School Board of Directors provides strategic oversight...",
            "responsibilities": [
                "Strategic planning and policy development",
                "Financial oversight and resource management",
                "Ensuring adherence to mission and values",
                "Community relations and partnerships",
                "Monitoring school performance and impact"
            ]
        },
        "management": {
            "description": "The School Management Committee works closely...",
            "functions": [
                "Academic program oversight",
                "Staff supervision and development",
                "Student welfare and discipline",
                "Infrastructure and facilities management",
                "Coordination with stakeholders"
            ]
        },
        "headTeacher": {
            "description": "The Head Teacher is the chief academic and administrative officer...",
            "responsibilities": [
                "Educational leadership and curriculum implementation",
                "Staff recruitment, training, and evaluation",
                "Student enrollment and academic progress monitoring",
                "Community engagement and parent relations"
            ]
        }
    }

# ==============================
# PARTNERSHIPS ENDPOINT
# ==============================
@api_router.get("/partnerships", tags=["partnerships"])
async def get_partnerships():
    return [
        {
            "id": 1,
            "name": "GESS (Girls' Education South Sudan)",
            "description": "We are proud members of GESS, working together to improve access to quality education for all children, with a special focus on girls' education in South Sudan.",
            "icon": "Handshake"
        },
        {
            "id": 2,
            "name": "National Education Cluster",
            "description": "Through the National Education Cluster, we coordinate with government agencies and NGOs to strengthen education systems and share best practices.",
            "icon": "Users"
        },
        {
            "id": 3,
            "name": "Protection & Child Protection Cluster",
            "description": "We actively participate in child protection initiatives, ensuring the safety and wellbeing of every child under our care and in the wider community.",
            "icon": "Shield"
        }
    ]

# ==============================
# HOME STATS ENDPOINT
# ==============================
@api_router.get("/home/stats", tags=["home"])
async def home_stats():
    return {
        "childrenSupported": 120,
        "programs": 2,
        "foundedYear": 2023
    }

# ==============================
# ABOUT ENDPOINT
# ==============================
@api_router.get("/about", tags=["about"])
async def get_about():
    return {
        "title": "About Us",
        "subtitle": "A faith-based institution dedicated to transforming lives",
        "image": "https://images.unsplash.com/photo.jpg",
        "storyTitle": "Our Story",
        "story": [
            "Heavenly Nature Nursery & Primary School was founded in February 2023...",
            "Located in Juba City, Central Equatoria State, we provide free education..."
        ],
        "purposeTitle": "Our Purpose",
        "purpose": [
            "Provide free education to children who cannot afford school fees",
            "Rescue and rehabilitate street children and abandoned children",
            "Instill Christian values while respecting all children regardless of background",
            "Develop future leaders who will transform their communities",
            "Partner with stakeholders to create lasting impact"
        ],
        "futureTitle": "Looking to the Future",
        "futureText": "We envision establishing a secondary school to provide continuous education pathways..."
    }

# ==============================
# VISION & MISSION ENDPOINT
# ==============================
@api_router.get("/vision", tags=["vision"])
async def get_vision():
    return {
        "vision": "To be a beacon of hope and excellence in education, nurturing future leaders who will transform South Sudan through knowledge, faith, and compassion.",
        "mission": "To provide free, holistic, and faith-based education to street children, abandoned children, and orphans, empowering them with knowledge, skills, and Christian values to become transformative leaders in their communities and beyond.",
        "values": [
            {
                "key": "volunteerism",
                "title": "Volunteerism & Professionalism",
                "description": "We are driven by a genuine desire to serve. Our staff and volunteers bring both compassion and professional excellence to every interaction."
            },
            {
                "key": "transparency",
                "title": "Transparency & Accountability",
                "description": "We operate with complete honesty and integrity. Every donation, decision, and action is made with accountability to our children, partners, and community."
            },
            {
                "key": "teamwork",
                "title": "Teamwork",
                "description": "We believe in the power of collaboration. By working together—staff, volunteers, partners, and the community—we achieve greater impact."
            }
        ],
        "footer": "Every child is created with a purpose. Our values guide us as we help them discover and fulfill that purpose through education, love, and unwavering support."
    }

# ==============================
# Include router
# ==============================
app.include_router(api_router)

# ==============================
# MongoDB Connection (AFTER app setup)
# ==============================
try:
    client = AsyncIOMotorClient(MONGO_URL) if MONGO_URL else None
    db = client[DB_NAME] if client else None
    if client:
        # Test connection
        await client.admin.command('ping')
        logging.info("✅ MongoDB connected successfully")
except Exception as e:
    logging.warning(f"⚠️ MongoDB connection failed: {e}")
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
    """Root health check endpoint for Render/load balancers"""
    return JSONResponse(
        content={
            "status": "healthy",
            "service": "Heavenly Nature Schools API",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        status_code=200
    )

# Try to mount static files if directories exist
static_dir = ROOT_DIR / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

if UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    favicon_path = ROOT_DIR / "favicon.ico"
    if favicon_path.exists():
        return FileResponse(favicon_path)
    
    static_favicon = ROOT_DIR / "static" / "favicon.ico"
    if static_favicon.exists():
        return FileResponse(static_favicon)
    
    # Return a simple default response
    return JSONResponse(content={"message": "No favicon found"}, status_code=404)

# ==============================
# Logging
# ==============================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
logger.info(f"CORS allowed origins: {cors_origins}")

# ==============================
# Shutdown event
# ==============================
@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        logger.info("Closing MongoDB connection...")
        client.close()
        logger.info("MongoDB connection closed.")

# ==============================
# Error handlers
# ==============================
@app.exception_handler(404)
async def not_found_exception_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Not Found",
            "message": f"The requested URL {request.url} was not found on this server.",
            "available_endpoints": [
                "/",
                "/api/",
                "/api/health",
                "/api/blog",
                "/api/events",
                "/api/contact",
                "/api/governance",
                "/api/partnerships",
                "/api/home/stats",
                "/api/about",
                "/api/vision",
                "/docs",
                "/redoc"
            ]
        }
    )

# ==============================
# Startup event
# ==============================
@app.on_event("startup")
async def startup_event():
    logger.info("Starting Heavenly Nature Schools API...")
    logger.info(f"MongoDB URL: {'Set' if MONGO_URL else 'Not set'}")
    logger.info(f"Database: {DB_NAME}")
    logger.info(f"Upload directory: {UPLOAD_DIR}")
