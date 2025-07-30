# Cosmic Quest 🚀

An AI-powered space exploration and information assistant that combines interactive chat capabilities with scientific fact-checking. Explore the cosmos through intelligent conversations and verify space-related information against trusted scientific sources.

## Features

- **🌌 Interactive AI Chat**: Engage with an AI agent specialized in space exploration and astronomy
- **🔍 Scientific Fact Checker**: Cross-reference space information against ArXiv papers and Wikipedia with confidence scoring
- **🖼️ Astronomical Image Analysis**: Upload celestial images for AI-powered analysis and insights
- **✨ Immersive Space UI**: Beautiful cosmic-themed interface with animations and stellar visuals
- **📊 Accuracy Assessment**: Get confidence scores and recommendations for scientific information
- **🛠️ Multi-Modal Intelligence**: Supports both text queries and image uploads for comprehensive analysis

## Tech Stack

### Frontend
- **React.js** with Vite for fast development
- **Tailwind CSS** for styling with custom space-themed animations
- **Axios** for API communication
- **marked.js** for markdown rendering
- **DOMPurify** for secure HTML sanitization

### Backend
- **Python FastAPI** for high-performance API endpoints
- **ChromaDB** for vector storage and semantic search
- **AI Agents** for specialized space knowledge processing
- **External API Integration** (NASA, ArXiv, Wikipedia)

## Project Structure

```
space_chat/
├── frontend/           # React.js frontend application
│   ├── src/
│   │   ├── App.jsx    # Main application component
│   │   ├── App.css    # Application styles
│   │   └── main.jsx   # React entry point
│   ├── package.json
│   └── vite.config.js
├── backend/            # Python FastAPI backend
│   ├── app/
│   │   ├── agents.py      # AI agent implementations
│   │   ├── models.py      # Data models
│   │   ├── orchestrator.py # Agent coordination
│   │   ├── vector_store.py # ChromaDB integration
│   │   └── tools/         # External API tools
│   ├── main.py        # FastAPI application entry
│   └── requirements.txt
└── README.md          # This file
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python main.py
   ```

The backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Start Your Cosmic Journey**: Launch the application and click "Launch Into Space" to begin
2. **Ask Space Questions**: Type any astronomy or space-related question in the chat interface
3. **Upload Images**: Click the image button to upload astronomical photos for analysis
4. **Fact Check Information**: Use the dedicated fact checker to verify scientific claims
5. **Explore Further**: Use the action buttons to simplify explanations, dive deeper, or discover related topics

## API Endpoints

- `POST /chat` - Interactive chat with AI agent
- `POST /fact-check` - Verify scientific information
- `POST /action` - Perform specific actions (simplify, deep dive, suggestions)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- NASA API for space data
- ArXiv for scientific papers
- Wikipedia for general knowledge
- The amazing space exploration community

---

*Embark on an infinite journey through space and ideas with Cosmic Quest!* 🌌✨


Note: The Readme was generated using LLM
