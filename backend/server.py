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
import json
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
SECRET_KEY = os.environ.get("SECRET_KEY", "your-very-secure-random-secret-key-change-this")  # Add to .env!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": token_data.email})
    if user is None:
        raise credentials_exception
    return user  # Return full user doc (or filter fields)

# ==============================
# Models
# ==============================
# ... (your existing BlogPost, Event, ContactMessage, Governance* models unchanged)

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: EmailStr
    hashed_password: str
    is_admin: bool = True  # For simplicity; extend later

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    subject: str
    message: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==============================
# Utility: Save uploaded file (unchanged)
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
# AUTH: Login endpoint
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
# CONTACTS (protected + public POST)
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
    
    contact = ContactMessage(
        name=name, email=email, phone=phone, subject=subject, message=message
    )
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
async def delete_contact(
    contact_id: str,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    if db is None:
        raise HTTPException(503, detail="Database unavailable")
    try:
        result = await db.contacts.delete_one({"_id": uuid.UUID(contact_id)})  # if using UUID; else ObjectId
        # If using ObjectId: from bson import ObjectId; {"_id": ObjectId(contact_id)}
    except:
        result = await db.contacts.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return None

# ==============================
# Existing endpoints (add DB checks if needed, protect admin ones)
# e.g., wrap blog/events POST/PUT/DELETE with Depends(get_current_user)
# ==============================
# ... your existing @api_router.get("/blog"), etc. remain unchanged

# Include router
app.include_router(api_router)

# ==============================
# Startup & Shutdown (unchanged)
# ==============================
# ... your existing startup_event and shutdown_db_client unchanged

# Root redirect, static, logging, 404 handler (unchanged)
# ...

logger.info("Server configured with JWT auth")
