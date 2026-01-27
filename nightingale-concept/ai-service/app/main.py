from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging
import os

from app.api.endpoints import router as api_router
from app.config import HealthAIConfig

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Nightingale Health AI Service",
    description="Medical AI model service for Nightingale Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Restrict in production
)

# Include routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint with service info"""
    return {
        "service": "Nightingale Health AI Service",
        "version": "1.0.0",
        "status": "operational",
        "models": {
            "available": len(HealthAIConfig.get_recommended_models()),
            "recommended": HealthAIConfig.get_recommended_models()
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": __import__("datetime").datetime.now().isoformat()
    }

@app.get("/models")
async def list_models():
    """List all available models"""
    return {
        "models": HealthAIConfig.AVAILABLE_MODELS,
        "recommended": HealthAIConfig.get_recommended_models()
    }

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Nightingale Health AI Service")
    logger.info(f"Recommended models: {HealthAIConfig.get_recommended_models()}")
    
    # Check HuggingFace token
    if os.getenv("HF_TOKEN"):
        logger.info("HuggingFace token found")
    else:
        logger.warning("No HuggingFace token found. Some models may not be accessible.")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Nightingale Health AI Service")
