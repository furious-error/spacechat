# app/orchestrator.py
from typing import Optional, Union, Dict, Any
# We will import two specific agent chains now
from .agents import create_multimodal_agent_chain, create_text_agent_chain, create_action_handler_chain, create_fact_checker_chain
from .models import ChatResponse, FactCheckResponse

async def get_agentic_response(query: str, image_base64: Optional[str] = None, enable_fact_check: bool = True) -> Dict[str, Any]:
    """
    Orchestrates the correct agent (multimodal or text-only) based on the input.
    Optionally includes fact-checking validation.
    """
    # Get the initial response
    if image_base64:
        # If an image is provided, use the multimodal chain
        agent_chain = create_multimodal_agent_chain()
        response = await agent_chain.ainvoke({
            "query": query,
            "image_base64": image_base64
        })
    else:
        # If no image is provided, use the simpler text-only chain
        agent_chain = create_text_agent_chain()
        response = await agent_chain.ainvoke({"query": query})
    
    # Extract answer from response (handling both dict and Pydantic model)
    try:
        if isinstance(response, dict):
            answer_text = response.get('answer', '')
            image_urls = response.get('image_urls', [])
        else:
            # Handle Pydantic model
            answer_text = getattr(response, 'answer', '')
            image_urls = getattr(response, 'image_urls', [])
    except Exception:
        # Fallback if attribute access fails
        answer_text = str(response)
        image_urls = []
    
    # Create base response dict
    result = {
        "answer": answer_text,
        "image_urls": image_urls
    }
    
    # If fact-checking is enabled and the query is not conversational
    if enable_fact_check and not _is_conversational_query(query):
        try:
            fact_check_result = await perform_fact_check(query, answer_text)
            
            # Extract fact check data safely using getattr for all attributes
            fact_check_data = {
                "is_accurate": getattr(fact_check_result, 'is_accurate', True),
                "confidence_score": getattr(fact_check_result, 'confidence_score', 0.5),
                "issues_found": getattr(fact_check_result, 'issues_found', []),
                "verified_facts": getattr(fact_check_result, 'verified_facts', []),
                "recommendations": getattr(fact_check_result, 'recommendations', "No recommendations available.")
            }
            
            result["fact_check"] = fact_check_data
            
        except Exception as e:
            print(f"Fact checking failed: {e}")
            # Add placeholder fact check data
            result["fact_check"] = {
                "is_accurate": True,
                "confidence_score": 0.5,
                "issues_found": ["Fact checking unavailable"],
                "verified_facts": [],
                "recommendations": "Fact checking could not be completed."
            }
    
    return result

# This function remains the same
async def handle_agent_action(action: str, topic: str):
    """
    Orchestrates the action handler agent to perform a follow-up action.
    """
    action_chain = create_action_handler_chain(action)
    response = await action_chain.ainvoke({"topic": topic})
    
    # The response format depends on the action
    if action == "suggest_questions":
        return response # This is already a SuggestionResponse model
    else:
        # For eli5 and deep_dive, the response is a simple string
        return {"answer": response}


def _is_conversational_query(query: str) -> bool:
    """
    Determines if a query is conversational (greetings, thanks, etc.) and doesn't need fact-checking.
    """
    conversational_patterns = [
        "hello", "hi", "hey", "thank you", "thanks", "bye", "goodbye", 
        "how are you", "good morning", "good evening", "good afternoon"
    ]
    query_lower = query.lower().strip()
    return any(pattern in query_lower for pattern in conversational_patterns) or len(query.split()) <= 3


async def perform_fact_check(original_query: str, answer_to_check: str):
    """
    Performs fact-checking on a generated answer.
    """
    fact_checker = create_fact_checker_chain()
    fact_check_result = await fact_checker.ainvoke({
        "original_query": original_query,
        "answer_to_check": answer_to_check
    })
    return fact_check_result
