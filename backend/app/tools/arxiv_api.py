# app/tools/arxiv_api.py
import arxiv
from typing import List

def search_arxiv(query: str, max_results: int = 1) -> str:
    """
    Searches the arXiv API for a given query and returns a summary of the top result.

    Args:
        query: The search term (e.g., "Betelgeuse dimming").
        max_results: The maximum number of results to fetch. Defaults to 1.

    Returns:
        A formatted string containing the title, authors, URL, and summary
        of the most relevant paper, or an error message if no paper is found.
    """
    try:
        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance
        )

        result = next(search.results(), None)

        if result:
            authors = ", ".join(author.name for author in result.authors)
            return (
                f"ARXIV PAPER FOUND:\n"
                f"Title: {result.title}\n"
                f"Authors: {authors}\n"
                f"URL: {result.entry_id}\n"
                f"Summary: {result.summary}"
            )
        else:
            return "No relevant papers found on arXiv for the query."

    except Exception as e:
        print(f"An error occurred while searching arXiv: {e}")
        return "Sorry, I encountered an error while searching for scientific papers."

