# app/models.py
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List

# The main request model for a new chat query
class ChatRequest(BaseModel):
    query: str
    image_base64: Optional[str] = None

# The main response model for a chat query
class ChatResponse(BaseModel):
    answer: str
    image_urls: List[str]
    fact_check: Optional[FactCheckResponse] = None

# --- NEW ---
# The model for handling follow-up actions like "Explain Simply"
class ActionRequest(BaseModel):
    action: str  # e.g., "eli5", "deep_dive", "suggest_questions"
    topic: str   # The original user query, e.g., "What is a globular cluster?"

# The model for the "suggest_questions" action response
class SuggestionResponse(BaseModel):
    questions: List[str]

# The model for fact-checking response
class FactCheckResponse(BaseModel):
    is_accurate: bool
    confidence_score: float  # 0.0 to 1.0
    issues_found: List[str]  # List of potential inaccuracies or concerns
    verified_facts: List[str]  # List of facts that were verified as accurate
    recommendations: str  # Suggestions for improvement or clarification

# Enhanced response model that includes fact-checking
class EnhancedChatResponse(BaseModel):
    answer: str
    image_urls: List[str]
    fact_check: Optional[FactCheckResponse] = None

# Request model for standalone fact-checking
class FactCheckRequest(BaseModel):
    original_query: str
    answer_to_check: str
