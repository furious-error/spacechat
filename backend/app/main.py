# app/main.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .models import ChatRequest, ActionRequest, FactCheckResponse, FactCheckRequest 
from .orchestrator import get_agentic_response, handle_agent_action, perform_fact_check 

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

@app.post("/chat")
async def chat(request: ChatRequest):
    """Handles the main chat queries."""
    try:
        response = await get_agentic_response(request.query, request.image_base64)
        return response
    except Exception as e:
        print(f"An error occurred in /chat: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")


@app.post("/action")
async def perform_action(request: ActionRequest):
    """Handles follow-up actions like ELI5, deep dive, etc."""
    try:
        response = await handle_agent_action(request.action, request.topic)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"An error occurred in /action: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform the requested action.")


@app.post("/fact-check")
async def fact_check(request: FactCheckRequest):
    """Handles standalone fact-checking requests."""
    try:
        fact_check_result = await perform_fact_check(request.original_query, request.answer_to_check)
        return fact_check_result
    except Exception as e:
        print(f"An error occurred in /fact-check: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform fact-checking.")

