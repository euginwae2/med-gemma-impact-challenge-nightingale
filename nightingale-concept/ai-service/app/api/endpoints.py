from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import logging
import json

from app.api.schemas import (
    TextGenerationRequest,
    MedicalQARequest,
    ClinicalSummaryRequest,
    ModelInfo
)
from app.models.medgemma import MedGemmaHandler, GenerationConfig
from app.config import HealthAIConfig

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize model handlers
model_handlers = {}

def get_model_handler(model_id: str = "medgemma_2b") -> MedGemmaHandler:
    """Get or create model handler"""
    if model_id not in model_handlers:
        model_info = HealthAIConfig.get_model_info(model_id)
        if not model_info:
            raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
        
        handler = MedGemmaHandler(model_info["name"])
        if not handler.load():
            raise HTTPException(status_code=500, detail=f"Failed to load model {model_id}")
        
        model_handlers[model_id] = handler
    
    return model_handlers[model_id]

@router.post("/text/generate")
async def generate_text(
    request: TextGenerationRequest,
    model_id: str = Form("medgemma_2b")
):
    """Generate text from prompt"""
    try:
        handler = get_model_handler(model_id)
        
        config = GenerationConfig(
            max_length=request.max_length or 512,
            temperature=request.temperature or 0.7
        )
        
        result = handler.generate(request.prompt, config)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
        
    except Exception as e:
        logger.error(f"Text generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/medical/qa")
async def medical_question_answering(
    request: MedicalQARequest,
    model_id: str = Form("medgemma_2b")
):
    """Answer medical questions"""
    try:
        handler = get_model_handler(model_id)
        result = handler.medical_qa(request.question, request.context or "")
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return {
            "question": request.question,
            "answer": result.get("answer", result.get("text", "")),
            "model": model_id,
            "generation_time": result.get("generation_time")
        }
        
    except Exception as e:
        logger.error(f"Medical QA error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clinical/summary")
async def clinical_summary(
    request: ClinicalSummaryRequest,
    model_id: str = Form("medgemma_2b")
):
    """Generate clinical note summaries"""
    try:
        handler = get_model_handler(model_id)
        result = handler.clinical_note_summary(request.note)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return {
            "summary": result.get("text", ""),
            "model": model_id,
            "format": "SOAP",
            "generation_time": result.get("generation_time")
        }
        
    except Exception as e:
        logger.error(f"Clinical summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain/term")
async def explain_medical_term(
    term: str = Form(...),
    reading_level: str = Form("patient"),
    model_id: str = Form("medgemma_2b")
):
    """Explain medical terms at different reading levels"""
    try:
        handler = get_model_handler(model_id)
        result = handler.medical_term_explanation(term, reading_level)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return {
            "term": term,
            "explanation": result.get("text", ""),
            "reading_level": reading_level,
            "model": model_id
        }
        
    except Exception as e:
        logger.error(f"Term explanation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/insurance/document")
async def process_insurance_document(
    file: UploadFile = File(...),
    extraction_type: str = Form("summary"),
    model_id: str = Form("medgemma_2b")
):
    """Process insurance documents"""
    try:
        content = await file.read()
        text_content = content.decode('utf-8', errors='ignore')[:5000]  # Limit size
        
        handler = get_model_handler(model_id)
        
        prompt = f"""Extract key information from this insurance document:

Document:
{text_content}

Extract:
1. Patient name
2. Policy number
3. Coverage details
4. Limitations/exclusions
5. Important dates

Format as JSON."""
        
        result = handler.generate(prompt, GenerationConfig(max_length=300))
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return {
            "filename": file.filename,
            "extraction_type": extraction_type,
            "result": result.get("text", ""),
            "model": model_id
        }
        
    except Exception as e:
        logger.error(f"Insurance document processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models/available")
async def get_available_models():
    """Get list of available models"""
    return {
        "models": HealthAIConfig.AVAILABLE_MODELS,
        "recommended": HealthAIConfig.get_recommended_models()
    }

@router.get("/models/{model_id}/info")
async def get_model_info(model_id: str):
    """Get information about a specific model"""
    info = HealthAIConfig.get_model_info(model_id)
    if not info:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
    
    return {
        "model_id": model_id,
        **info
    }
