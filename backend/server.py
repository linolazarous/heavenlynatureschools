from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

# ==============================
# Load environment variables
# ==============================
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ==============================
# MongoDB connection
# ==============================
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# ==============================
# Initialize FastAPI app
# ==============================
app = FastAPI(
    title="Heavenly Nature Schools API",
    description="Backend API for Heavenly Nature Schools Frontend",
    version="1.0.0",
)

# ==============================
# API Router
# ==============================
api_router = APIRouter(prefix="/api")


# ==============================
# Models
# ==============================
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore unknown fields like _id from MongoDB
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# ==============================
# API Routes
# ==============================
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ==============================
# Include router
# ==============================
app.include_router(api_router)


# ==============================
# CORS Middleware (Production-ready)
# ==============================
cors_origins = os.environ.get(
    'CORS_ORIGINS',
    'http://localhost,http://localhost:3000'
).split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    logger.info("Closing MongoDB connection...")
    client.close()
    logger.info("MongoDB connection closed.")
