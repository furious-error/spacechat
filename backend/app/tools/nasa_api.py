# app/tools/nasa_api.py
import requests
from typing import List

NASA_API_URL = "https://images-api.nasa.gov/search"

def search_nasa_images(query: str, count: int = 3) -> List[str]:
    """
    Searches the NASA Image and Video Library for a query and returns a list of image URLs.

    Args:
        query (str): The search term (e.g., "Betelgeuse", "James Webb Telescope").
        count (int): The number of image URLs to return.

    Returns:
        List[str]: A list of direct URLs to the images.
    """
    params = {
        "q": query,
        "media_type": "image"
    }
    try:
        response = requests.get(NASA_API_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        image_urls = []
        if 'collection' in data and 'items' in data['collection']:
            items = data['collection']['items']
            for item in items[:count]: 
                if 'links' in item and item['links']:
                    image_urls.append(item['links'][0]['href'])
        
        if not image_urls:
            return ["No images found for this query."]
            
        return image_urls
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from NASA API: {e}")
        return [f"An error occurred while searching for images: {e}"]

