# app/agents.py
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from typing import List

from .tools.arxiv_api import search_arxiv
from .tools.nasa_api import search_nasa_images
from .tools.wikipedia_api import search_wikipedia
from .models import ChatResponse, SuggestionResponse, FactCheckResponse

api_key = os.getenv("GOOGLE_API_KEY")

def create_text_agent_chain():
    """Creates an agent chain specifically for handling text-only queries."""
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.4,
        google_api_key=api_key
    )
    
    structured_llm = llm.with_structured_output(ChatResponse)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """
            You are a "Space Chat-Guide," an expert AI assistant for astronomy and space exploration.
            Your goal is to provide clear, accurate, and engaging answers.
            1.  **Analyze the user's query.**
            2.  **Synthesize information from the provided context** (arXiv papers, Wikipedia) to form a comprehensive answer.
            3.  **Search for relevant images** using the NASA tool based on the primary subject of the query.
            4.  **Format your response as a JSON object** that strictly follows the provided schema, including the textual answer and a list of image URLs.
            5.  If the user's query is conversational (e.g., "hello", "thank you"), provide a friendly, brief response and do not use tools.
        """),
        ("user", """
            CONTEXT:
            - ArXiv Papers: {arxiv_context}
            - Wikipedia: {wiki_context}

            USER QUERY: {query}
        """)
    ])

    agent_chain = RunnablePassthrough.assign(
        arxiv_context=lambda x: search_arxiv(x["query"]),
        wiki_context=lambda x: search_wikipedia(x["query"]),
    ) | prompt | structured_llm

    return agent_chain


def create_multimodal_agent_chain():
    """Creates the main agent chain for handling chat queries with images."""
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.4,
        google_api_key=api_key
    )
    
    structured_llm = llm.with_structured_output(ChatResponse)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """
            You are a "Space Chat-Guide," an expert AI assistant for astronomy and space exploration.
            Your goal is to provide clear, accurate, and engaging answers.
            1.  **Analyze the user's query AND the provided image.**
            2.  **Synthesize information from the provided context** (arXiv papers, Wikipedia) to form a comprehensive answer.
            3.  **Search for relevant images** using the NASA tool based on the primary subject of the query.
            4.  **Format your response as a JSON object** that strictly follows the provided schema, including the textual answer and a list of image URLs.
        """),
        ("user", [
            {"type": "text", "text": """
                CONTEXT:
                - ArXiv Papers: {arxiv_context}
                - Wikipedia: {wiki_context}

                USER QUERY: {query}
            """},
            {"type": "image_url", "image_url": "data:image/jpeg;base64,{image_base64}"}
        ])
    ])

    agent_chain = RunnablePassthrough.assign(
        arxiv_context=lambda x: search_arxiv(x["query"]),
        wiki_context=lambda x: search_wikipedia(x["query"]),
    ) | prompt | structured_llm

    return agent_chain


def create_action_handler_chain(action_type: str):
    """Creates a specific chain to handle follow-up actions."""
    if action_type == "suggest_questions":
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7, google_api_key=api_key)
        structured_llm = llm.with_structured_output(SuggestionResponse)
        prompt = ChatPromptTemplate.from_template("""
            You are a creative assistant. Based on the topic "{topic}", generate three interesting and distinct follow-up questions that a curious person might ask.
            The questions should be suitable for a chat and encourage further exploration.
            Format your response as a JSON object with a 'questions' key containing a list of strings.
        """)
        return prompt | structured_llm
    else:
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.5, google_api_key=api_key)
        
        if action_type == "eli5":
            prompt_template = "Explain the topic '{topic}' to me like I'm five years old, using simple terms and a real-world analogy."
        elif action_type == "deep_dive":
            prompt_template = "Provide a more detailed, in-depth explanation of the topic '{topic}'. Assume I have a basic understanding but want to know more technical details."
        else:
            raise ValueError("Invalid action type")

        prompt = ChatPromptTemplate.from_template(prompt_template)
        return prompt | llm | StrOutputParser()


def create_fact_checker_chain():
    """Creates a fact-checking agent to validate the accuracy of generated responses."""
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2, 
        google_api_key=api_key
    )
    
    structured_llm = llm.with_structured_output(FactCheckResponse)
    
    prompt = ChatPromptTemplate.from_template("""
        You are a rigorous fact-checking AI specializing in astronomy and space science.
        Your role is to validate the accuracy of information provided about space-related topics.
        
        ORIGINAL QUERY: {original_query}
        
        GENERATED ANSWER TO FACT-CHECK: {answer_to_check}
        
        SUPPORTING CONTEXT:
        - ArXiv Papers: {arxiv_context}
        - Wikipedia: {wiki_context}
        
        Instructions:
        1. **Cross-reference** the generated answer against the provided scientific sources (ArXiv papers, Wikipedia).
        2. **Identify any factual inaccuracies** or unsupported claims in the answer.
        3. **Verify scientific facts** mentioned in the answer against established astronomical knowledge.
        4. **Check for outdated information** that may no longer be accurate due to recent discoveries.
        5. **Assess the overall reliability** of the information provided.
        
        Provide your assessment as a structured response including:
        - Whether the information is generally accurate (is_accurate: true/false)
        - Confidence score from 0.0 to 1.0 (1.0 = completely accurate)
        - List of any issues or inaccuracies found
        - List of facts that were successfully verified
        - Recommendations for improving accuracy or clarity
        
        Be thorough but constructive in your fact-checking approach.
    """)
    
    fact_check_chain = RunnablePassthrough.assign(
        arxiv_context=lambda x: search_arxiv(x["original_query"]),
        wiki_context=lambda x: search_wikipedia(x["original_query"]),
    ) | prompt | structured_llm
    
    return fact_check_chain
