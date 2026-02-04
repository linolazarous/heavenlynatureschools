# backend/server.py
from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Depends, status, Request
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
SECRET_KEY = os.environ.get("SECRET_KEY")
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

async def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
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
    email: EmailStr
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
    access_token = await create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ==============================
# API ROOT (fixed & duplicated for /api and /api/)
# ==============================
@api_router.get("/", response_model=dict, tags=["root"])
@api_router.get("", response_model=dict, tags=["root"])  # handles /api without slash
async def api_root():
    return {
        "message": "Welcome to Heavenly Nature Schools API",
        "version": "1.0.0",
        "database_available": db is not None,
        "docs": "/docs",
        "health": "/api/health",
    }

# ==============================
# STATS
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
# CONTACTS (unchanged except ObjectId fix)
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
    doc = contact.model_dump(exclude={"id"})
    doc["date"] = doc["date"].isoformat()
    result = await db.contacts.insert_one(doc)
    contact.id = str(result.inserted_id)
    return contact

# ... rest of contacts endpoints unchanged ...

# Include router
app.include_router(api_router)

# ==============================
# Root redirect & static (unchanged)
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

# Static files mount
static_dir = ROOT_DIR / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

if UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)
logger.info(f"CORS allowed origins: {cors_origins}")
logger.info("Server configured with JWT auth")
