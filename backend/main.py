# main.py
import uvicorn
import os
from dotenv import load_dotenv

if __name__ == "__main__":
    # Load environment variables from the .env file
    load_dotenv()

    # Get port from environment variables or default to 8000
    port = int(os.getenv("PORT", 8000))

    # uvicorn.run is the command that starts the server.
    # "app.main:app" tells uvicorn where to find the FastAPI application instance.
    #   - "app.main" is the module (the app/main.py file)
    #   - ":app" is the FastAPI object you created inside that file
    # host="0.0.0.0" makes the server accessible on your network, not just on localhost.
    # reload=True automatically restarts the server when you make code changes.
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
