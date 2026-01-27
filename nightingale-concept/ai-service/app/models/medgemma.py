import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from typing import Dict, Any, Optional, List
import logging
from dataclasses import dataclass
import time

logger = logging.getLogger(__name__)

@dataclass
class GenerationConfig:
    """Configuration for text generation"""
    max_length: int = 512
    temperature: float = 0.7
    top_p: float = 0.9
    top_k: int = 50
    repetition_penalty: float = 1.1
    do_sample: bool = True

class MedGemmaHandler:
    """Handler for MedGemma models from HuggingFace"""
    
    def __init__(self, model_name: str = "google/medgemma-2b"):
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self.is_loaded = False
        
    def load(self) -> bool:
        """Load the model and tokenizer"""
        if self.is_loaded:
            return True
            
        try:
            logger.info(f"Loading model: {self.model_name} on {self.device}")
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )
            
            # Load model with appropriate settings
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                trust_remote_code=True,
                low_cpu_mem_usage=True
            )
            
            # Create pipeline for easier use
            self.pipeline = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if self.device == "cuda" else -1
            )
            
            self.is_loaded = True
            logger.info(f"Model {self.model_name} loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load model {self.model_name}: {e}")
            return False
    
    def generate(self, prompt: str, config: Optional[GenerationConfig] = None) -> Dict[str, Any]:
        """Generate text from prompt"""
        if not self.is_loaded and not self.load():
            return {"error": "Model failed to load"}
            
        config = config or GenerationConfig()
        
        try:
            start_time = time.time()
            
            # Generate text
            outputs = self.pipeline(
                prompt,
                max_length=config.max_length,
                temperature=config.temperature,
                top_p=config.top_p,
                top_k=config.top_k,
                repetition_penalty=config.repetition_penalty,
                do_sample=config.do_sample,
                num_return_sequences=1
            )
            
            generation_time = time.time() - start_time
            generated_text = outputs[0]['generated_text']
            
            return {
                "text": generated_text,
                "prompt": prompt,
                "model": self.model_name,
                "generation_time": generation_time,
                "config": config.__dict__
            }
            
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            return {"error": str(e)}
    
    def medical_qa(self, question: str, context: str = "") -> Dict[str, Any]:
        """Medical question answering"""
        prompt = f"""You are a medical AI assistant. Answer the question based on the context.

Context: {context}

Question: {question}

Answer: Provide a clear, accurate, and helpful response. If unsure, state that you cannot provide medical advice and recommend consulting a healthcare professional.
"""
        
        result = self.generate(prompt, GenerationConfig(max_length=300))
        if "text" in result:
            # Extract just the answer part
            answer = result["text"].split("Answer:")[-1].strip()
            result["answer"] = answer
            
        return result
    
    def clinical_note_summary(self, note: str) -> Dict[str, Any]:
        """Summarize clinical notes in SOAP format"""
        prompt = f"""Summarize the following clinical note in SOAP format:

Clinical Note:
{note}

SOAP Summary:
[Subjective]
[Objective]
[Assessment]
[Plan]

Provide the summary in the format above."""
        
        return self.generate(prompt, GenerationConfig(max_length=500))
    
    def medical_term_explanation(self, term: str, reading_level: str = "patient") -> Dict[str, Any]:
        """Explain medical terms at different reading levels"""
        level_instructions = {
            "patient": "Explain in simple, non-technical language suitable for patients",
            "student": "Explain for medical students with some technical detail",
            "professional": "Provide detailed, technical explanation for healthcare professionals"
        }
        
        instruction = level_instructions.get(reading_level, level_instructions["patient"])
        
        prompt = f"""{instruction}.

Term: {term}

Explanation:"""
        
        return self.generate(prompt, GenerationConfig(max_length=200))
