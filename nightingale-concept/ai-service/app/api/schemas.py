from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TextGenerationRequest(BaseModel):
    prompt: str
    max_length: Optional[int] = Field(512, ge=10, le=2048)
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0)

class MedicalQARequest(BaseModel):
    question: str
    context: Optional[str] = ""

class ClinicalSummaryRequest(BaseModel):
    note: str
    format: Optional[str] = "SOAP"

class ModelInfo(BaseModel):
    name: str
    description: str
    tasks: List[str]
    memory_required: str
    recommended: bool

class HealthResponse(BaseModel):
    status: str
    models_loaded: int
    timestamp: str

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: int
