# app/tools/wikipedia_api.py
import wikipedia

def search_wikipedia(query: str) -> str:
    """
    Searches Wikipedia for a given query and returns the summary of the top result.
    
    Args:
        query (str): The search term.
        
    Returns:
        str: The summary of the most relevant Wikipedia page, or an error message.
    """
    try:
        # search() returns a list of titles. We take the top one.
        search_results = wikipedia.search(query)
        if not search_results:
            return "No relevant Wikipedia page found."
        
        # summary() fetches the summary of the first search result.
        page_summary = wikipedia.summary(search_results[0], auto_suggest=False)
        return page_summary
    except wikipedia.exceptions.DisambiguationError as e:
        # Handle cases where a search term could mean multiple things
        return f"Ambiguous search term. Options: {e.options}"
    except wikipedia.exceptions.PageError:
        return "The requested page does not exist on Wikipedia."
    except Exception as e:
        return f"An error occurred during Wikipedia search: {e}"

