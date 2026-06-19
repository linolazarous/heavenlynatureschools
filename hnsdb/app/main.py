"""
Heavenly Nature School Management System - Main Application
Production-ready FastAPI application with comprehensive middleware and lifecycle management
"""
from fastapi import FastAPI, Request, status, HTTPException, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from datetime import datetime
import logging
import time
import sys
import os

from app.core.config import settings
from app.core.database import (
    connect_to_mongo, 
    close_mongo_connection, 
    check_database_health,
    get_connection_status
)
from app.api.v1 import (
    auth, users, students, teachers, classes, 
    attendance, exams, financial, reports, school
)

# =========================================================================
# LOGGING CONFIGURATION
# =========================================================================

# Ensure logs directory exists
if settings.LOG_FILE:
    log_dir = os.path.dirname(settings.LOG_FILE)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)

# Configure logging
logging_config = {
    "level": getattr(logging, settings.LOG_LEVEL),
    "format": settings.LOG_FORMAT,
    "handlers": [logging.StreamHandler(sys.stdout)]
}

# Add file handler if log file specified
if settings.LOG_FILE:
    logging_config["handlers"].append(
        logging.FileHandler(settings.LOG_FILE)
    )

logging.basicConfig(**logging_config)
logger = logging.getLogger(__name__)

# Suppress noisy third-party loggers
logging.getLogger("motor").setLevel(logging.WARNING)
logging.getLogger("pymongo").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)


# =========================================================================
# APPLICATION LIFECYCLE
# =========================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle application startup and shutdown events
    """
    logger.info("=" * 60)
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"   Environment: {settings.ENVIRONMENT}")
    logger.info(f"   Debug Mode: {settings.DEBUG}")
    logger.info("=" * 60)
    
    # Startup
    startup_start = time.time()
    
    try:
        logger.info("📦 Connecting to MongoDB...")
        await connect_to_mongo()
        logger.info("✅ MongoDB connection established")
        await seed_default_data()
        await initialize_services()
    except Exception as e:
        logger.warning(f"⚠️  MongoDB not available: {e}")
        logger.warning("⚠️  Starting in API-only mode (no database)")
    
    startup_time = time.time() - startup_start
    logger.info(f"✅ Application startup complete ({startup_time:.2f}s)")
    logger.info(f"📡 API available at http://{settings.HOST}:{settings.PORT}{settings.API_V1_PREFIX}")
    logger.info(f"📚 API Documentation: http://{settings.HOST}:{settings.PORT}/docs")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down application...")
    
    try:
        await close_mongo_connection()
        logger.info("✅ MongoDB connection closed")
    except Exception as e:
        logger.error(f"❌ Error during shutdown: {e}")
    
    logger.info("👋 Application shutdown complete")


async def seed_default_data():
    """Seed default school information and admin user"""
    from app.core.database import db
    
    try:
        # Create initial admin user
        from app.services.auth_service import create_initial_admin
        await create_initial_admin(db)
        
        # Ensure school info exists
        school_info = await db.school_info.find_one({})
        if not school_info:
            await db.school_info.insert_one({
                "school_name": settings.SCHOOL_NAME,
                "motto": settings.SCHOOL_MOTTO,
                "vision": "To be a leading educational institution nurturing righteous leaders for tomorrow",
                "mission": "To provide quality education in a nurturing environment that develops academic excellence, moral values, and leadership skills",
                "core_values": ["Excellence", "Integrity", "Compassion", "Discipline", "Service"],
                "contact_email": settings.SCHOOL_EMAIL,
                "contact_phone": settings.SCHOOL_PHONE,
                "address": {
                    "city": "Juba",
                    "state": "Central Equatoria",
                    "country": "South Sudan"
                },
                "logo_url": None,
                "logo_thumbnail_url": None,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            logger.info("✅ Default school info created")
        else:
            logger.info("ℹ️  School info already exists")
        
        # Initialize class levels
        from app.models.class_model import ClassModel
        from app.models.school import SchoolModel
        academic_year = SchoolModel._get_current_academic_year()
        await ClassModel.initialize_class_levels(db, academic_year)
        logger.info(f"✅ Class levels initialized for {academic_year}")
        
    except Exception as e:
        logger.error(f"❌ Error seeding default data: {e}")
        if settings.is_development:
            raise


async def initialize_services():
    """Initialize background services and scheduled tasks"""
    from app.core.database import db
    
    try:
        # Check for overdue leave returns
        await check_overdue_leaves(db)
        
        # Clean expired tokens
        await clean_expired_tokens(db)
        
        logger.info("✅ Services initialized")
    except Exception as e:
        logger.warning(f"⚠️  Service initialization warning: {e}")


async def check_overdue_leaves(db):
    """Check and update teachers whose leave has ended"""
    try:
        today = datetime.utcnow()
        result = await db.teacher_leaves.update_many(
            {
                "status": "approved",
                "end_date": {"$lt": today}
            },
            {"$set": {"status": "completed", "updated_at": today}}
        )
        
        if result.modified_count > 0:
            logger.info(f"✅ Updated {result.modified_count} completed leaves")
            
    except Exception as e:
        logger.warning(f"⚠️  Leave check warning: {e}")


async def clean_expired_tokens(db):
    """Clean expired reset tokens"""
    try:
        today = datetime.utcnow()
        result = await db.users.update_many(
            {"reset_token_expires": {"$lt": today}},
            {
                "$unset": {
                    "reset_token": "",
                    "reset_token_expires": ""
                }
            }
        )
        
        if result.modified_count > 0:
            logger.info(f"✅ Cleaned {result.modified_count} expired reset tokens")
            
    except Exception as e:
        logger.warning(f"⚠️  Token cleanup warning: {e}")


# =========================================================================
# APPLICATION INSTANCE
# =========================================================================

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    openapi_url="/openapi.json" if settings.is_development else None,
    contact={
        "name": "Heavenly Nature School Administration",
        "email": settings.SCHOOL_EMAIL,
        "url": settings.SCHOOL_WEBSITE,
    },
    license_info={
        "name": "Proprietary",
        "url": "https://heavenlynatureschools.com/terms",
    },
    terms_of_service="https://heavenlynatureschools.com/terms",
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,  # Hide schemas by default
        "docExpansion": "list",  # Collapse endpoints
        "filter": True,  # Enable search
        "tagsSorter": "alpha",  # Sort tags alphabetically
    }
)


# =========================================================================
# MIDDLEWARE
# =========================================================================

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS if not settings.is_development else ["*"],
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
    expose_headers=["X-Request-ID", "X-Response-Time", "X-RateLimit-Remaining"],
    max_age=600  # Cache preflight requests for 10 minutes
)

# GZip Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Trusted Host Middleware (Production only)
if settings.is_production:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "heavenlynatureschools.com",
            "www.heavenlynatureschools.com",
            "api.heavenlynatureschools.com",
            "heavenlynature.vercel.app",
            "heavenly-nature-school.vercel.app",
            "*.onrender.com",
            "*.railway.app",
        ]
    )


# =========================================================================
# CUSTOM MIDDLEWARE
# =========================================================================

@app.middleware("http")
async def add_request_id_and_timing(request: Request, call_next):
    """Add request ID and response time headers"""
    import uuid
    
    # Generate unique request ID
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    
    # Record start time
    start_time = time.time()
    
    # Process request
    try:
        response = await call_next(request)
        
        # Add custom headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{(time.time() - start_time):.3f}s"
        
        # Log request
        if settings.is_development:
            logger.info(
                f"📡 {request.method} {request.url.path} "
                f"- {response.status_code} "
                f"({(time.time() - start_time):.3f}s) "
                f"[{request_id}]"
            )
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Request failed [{request_id}]: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Internal server error",
                "request_id": request_id
            }
        )


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    from app.core.security import RateLimiter
    
    # Skip rate limiting for health check and docs
    if request.url.path in ["/health", "/", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
    
    client_ip = request.client.host if request.client else "unknown"
    
    if RateLimiter.is_rate_limited(client_ip):
        remaining = RateLimiter.get_remaining(client_ip)
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "success": False,
                "message": "Too many requests. Please try again later.",
                "retry_after": settings.RATE_LIMIT_WINDOW_SECONDS
            },
            headers={
                "X-RateLimit-Remaining": str(remaining),
                "Retry-After": str(settings.RATE_LIMIT_WINDOW_SECONDS)
            }
        )
    
    response = await call_next(request)
    
    remaining = RateLimiter.get_remaining(client_ip)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    
    return response


# =========================================================================
# EXCEPTION HANDLERS
# =========================================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed messages"""
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        errors.append({
            "field": field,
            "message": error["msg"],
            "type": error["type"]
        })
    
    logger.warning(f"Validation error: {errors}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error",
            "errors": errors
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "status_code": exc.status_code
        },
        headers=getattr(exc, "headers", None)
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors"""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"❌ Unhandled error [{request_id}]: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected error occurred" if settings.is_production else str(exc),
            "request_id": request_id
        }
    )


# =========================================================================
# API ROUTERS
# =========================================================================

# Version 1 API
app.include_router(
    auth.router, 
    prefix=f"{settings.API_V1_PREFIX}/auth", 
    tags=["🔐 Authentication"]
)
app.include_router(
    users.router, 
    prefix=f"{settings.API_V1_PREFIX}/users", 
    tags=["👥 Users"]
)
app.include_router(
    students.router, 
    prefix=f"{settings.API_V1_PREFIX}/students", 
    tags=["🎓 Students"]
)
app.include_router(
    teachers.router, 
    prefix=f"{settings.API_V1_PREFIX}/teachers", 
    tags=["👨‍🏫 Teachers"]
)
app.include_router(
    classes.router, 
    prefix=f"{settings.API_V1_PREFIX}/classes", 
    tags=["🏫 Classes"]
)
app.include_router(
    attendance.router, 
    prefix=f"{settings.API_V1_PREFIX}/attendance", 
    tags=["📋 Attendance"]
)
app.include_router(
    exams.router, 
    prefix=f"{settings.API_V1_PREFIX}/exams", 
    tags=["📝 Exams"]
)
app.include_router(
    financial.router, 
    prefix=f"{settings.API_V1_PREFIX}/financial", 
    tags=["💰 Financial"]
)
app.include_router(
    reports.router, 
    prefix=f"{settings.API_V1_PREFIX}/reports", 
    tags=["📊 Reports"]
)
app.include_router(
    school.router, 
    prefix=f"{settings.API_V1_PREFIX}/school", 
    tags=["🏛️ School"]
)


# =========================================================================
# ROOT ENDPOINTS
# =========================================================================

@app.get("/", tags=["System"])
async def root():
    """Root endpoint with API information"""
    return {
        "success": True,
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "running",
        "documentation": "/docs",
        "health_check": "/health",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health", tags=["System"])
async def health_check():
    """Comprehensive health check endpoint"""
    from app.core.database import db
    
    health_data = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "application": {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        },
        "database": {
            "status": "disconnected"
        }
    }
    
    # Check database health
    try:
        db_health = await check_database_health()
        health_data["database"] = db_health
    except Exception as e:
        health_data["database"] = {
            "status": "error",
            "error": str(e)
        }
        health_data["status"] = "degraded"
    
    return health_data


@app.get("/status", tags=["System"])
async def system_status():
    """Get detailed system status"""
    from app.core.database import get_connection_status
    
    return {
        "success": True,
        "application": {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "debug": settings.DEBUG,
            "uptime": "N/A"  # Could track with a global start_time variable
        },
        "database": get_connection_status(),
        "config": {
            "email_enabled": settings.EMAIL_ENABLED,
            "cache_enabled": settings.CACHE_ENABLED,
            "rate_limiting": settings.RATE_LIMIT_ENABLED,
            "r2_configured": bool(settings.R2_ACCESS_KEY_ID),
            "brevo_configured": bool(settings.BREVO_API_KEY)
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Favicon endpoint"""
    from fastapi.responses import Response
    return Response(status_code=204)


# =========================================================================
# RUNNER (for direct execution)
# =========================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.is_development,
        workers=settings.WORKERS if not settings.is_development else 1,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=settings.is_development,
        proxy_headers=True,
        forwarded_allow_ips="*",
    )