import os
from typing import Dict, Optional, List

class HealthAIConfig:
    """Configuration for Health AI Models"""
    
    # Available models on HuggingFace
    AVAILABLE_MODELS = {
        "text": {
            "medgemma_2b": {
                "name": "google/medgemma-2b",
                "description": "MedGemma 2B for medical text understanding",
                "tasks": ["qa", "summarization", "clinical_reasoning"],
                "memory_required": "4GB",
                "recommended": True
            },
            "medgemma_9b": {
                "name": "google/medgemma-9b",
                "description": "MedGemma 9B for advanced medical reasoning",
                "tasks": ["complex_qa", "clinical_decision_support"],
                "memory_required": "16GB",
                "recommended": False  # Too large for concept study
            },
            "clinical_bert": {
                "name": "emilyalsentzer/Bio_ClinicalBERT",
                "description": "Clinical BERT for medical text classification",
                "tasks": ["ner", "classification", "extraction"],
                "memory_required": "1GB",
                "recommended": True
            }
        },
        "multimodal": {
            "medgemma_multimodal": {
                "name": "google/medgemma-2b-it",  # Example
                "description": "MedGemma for text+image understanding",
                "tasks": ["image_captioning", "visual_qa"],
                "memory_required": "8GB",
                "recommended": False
            }
        },
        "audio": {
            "wav2vec2_medical": {
                "name": "facebook/wav2vec2-base-960h",
                "description": "Speech recognition for medical dictation",
                "tasks": ["transcription", "asr"],
                "memory_required": "2GB",
                "recommended": True
            }
        },
        "vision": {
            "chexnet": {
                "name": "microsoft/chexnet",
                "description": "Chest X-ray abnormality detection",
                "tasks": ["classification", "detection"],
                "memory_required": "2GB",
                "recommended": True
            }
        }
    }
    
    @classmethod
    def get_recommended_models(cls) -> List[str]:
        """Get list of recommended models for concept study"""
        recommended = []
        for category, models in cls.AVAILABLE_MODELS.items():
            for model_id, config in models.items():
                if config.get("recommended", False):
                    recommended.append(model_id)
        return recommended
    
    @classmethod
    def get_model_info(cls, model_id: str) -> Optional[Dict]:
        """Get configuration for a specific model"""
        for category, models in cls.AVAILABLE_MODELS.items():
            if model_id in models:
                return models[model_id]
        return None
