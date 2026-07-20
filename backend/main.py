import os
import sys
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Add project root to path to ensure proper imports when running via uvicorn
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.config import settings
from backend.auth import router as auth_router
from backend.predictions import router as predict_router
from backend.governance import router as gov_router
from backend.audits import router as audit_router
from backend.patients import router as patient_router
from backend.notifications import router as notification_router
from backend.reports import router as reports_router
from backend.profile import router as profile_router
from backend.admin import router as admin_router

# Setup API logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("FastAPIApplication")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI REST Backend for Coronary Heart Disease Clinical Decision Support System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system error occurred: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "A critical system error occurred. Please contact the administrator."
        },
    )


# Routers registration
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(gov_router)
app.include_router(audit_router)
app.include_router(patient_router)
app.include_router(notification_router)
app.include_router(reports_router)
app.include_router(profile_router)
app.include_router(admin_router)


# Health check endpoint
@app.get("/health", tags=["System Checks"])
def health_check():
    """Checks the API service status."""
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENV,
        "debug_mode": settings.DEBUG,
    }


if __name__ == "__main__":
    logger.info("Starting local Uvicorn development server...")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
