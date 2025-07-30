# app/models.py
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    query: str
    image_base64: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    image_urls: List[str]
    fact_check: Optional[FactCheckResponse] = None

class ActionRequest(BaseModel):
    action: str 
    topic: str 

class SuggestionResponse(BaseModel):
    questions: List[str]

class FactCheckResponse(BaseModel):
    is_accurate: bool
    confidence_score: float  
    issues_found: List[str]  
    verified_facts: List[str]  
    recommendations: str  

class EnhancedChatResponse(BaseModel):
    answer: str
    image_urls: List[str]
    fact_check: Optional[FactCheckResponse] = None

class FactCheckRequest(BaseModel):
    original_query: str
    answer_to_check: str
