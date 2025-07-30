import axios from 'axios';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useEffect, useRef, useState } from 'react';

// Add CSS for animations
const globalStyles = `
  @keyframes sparkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
  
  @keyframes twinkle {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  
  @keyframes fadeInDown {
    0% { opacity: 0; transform: translateY(-20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes orbit {
    0% { transform: rotate(0deg) translateX(30px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
  }
  
  @keyframes shootingStar {
    0% { transform: translateX(-100px) translateY(0px); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateX(300px) translateY(-200px); opacity: 0; }
  }
`;

// Inject styles into head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = globalStyles;
  document.head.appendChild(styleSheet);
}

// --- Helper Components ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="w-6 h-6 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>
    <span className="ml-3 text-gray-300">The agent is thinking...</span>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg my-2 text-center">
    <strong className="font-bold">Error: </strong>
    <span className="block sm:inline">{message}</span>
  </div>
);

// --- Landing Page Component ---
const LandingPage = ({ onStart }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
    {/* Pure CSS starfield background */}
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-purple-950/30 to-slate-950 opacity-90"></div>
    <div className="absolute inset-0" style={{
      background: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                   radial-gradient(circle at 80% 20%, rgba(159, 122, 234, 0.3) 0%, transparent 50%),
                   radial-gradient(circle at 40% 80%, rgba(79, 172, 254, 0.2) 0%, transparent 50%)`,
    }}></div>

    {/* Pure CSS twinkling stars */}
    <div className="absolute inset-0" style={{
      background: `radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                   radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                   radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                   radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
                   radial-gradient(2px 2px at 160px 30px, #ddd, transparent)`,
      animation: 'sparkle 4s ease-in-out infinite alternate',
    }}></div>

    {/* Floating space elements */}
    <div className="absolute inset-0 pointer-events-none">
      {/* Pulsing stars */}
      <div className="absolute top-16 left-12 animate-[twinkle_4s_ease-in-out_infinite] opacity-80">
        <div className="bg-yellow-400/30 rounded-full p-2 backdrop-blur-sm border border-yellow-300/40 shadow-lg shadow-yellow-400/20">
          <span className="text-xl">⭐</span>
        </div>
      </div>
      <div className="absolute top-24 right-20 animate-[twinkle_6s_ease-in-out_infinite_2s] opacity-60">
        <div className="bg-blue-400/30 rounded-full p-2 backdrop-blur-sm border border-blue-300/40 shadow-lg shadow-blue-400/20">
          <span className="text-lg">✨</span>
        </div>
      </div>
      <div className="absolute bottom-20 left-16 animate-[twinkle_5s_ease-in-out_infinite_1s] opacity-70">
        <div className="bg-purple-400/30 rounded-full p-2 backdrop-blur-sm border border-purple-300/40 shadow-lg shadow-purple-400/20">
          <span className="text-xl">⭐</span>
        </div>
      </div>

      {/* Floating cosmic objects */}
      <div className="absolute top-32 left-8 animate-[orbit_20s_linear_infinite] opacity-60">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full p-3 backdrop-blur-sm border border-cyan-400/30 shadow-xl shadow-cyan-400/10">
          <span className="text-2xl">🌍</span>
        </div>
      </div>
      <div className="absolute top-40 right-12 animate-[orbit_25s_linear_infinite_reverse] opacity-50">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full p-3 backdrop-blur-sm border border-pink-400/30 shadow-xl shadow-pink-400/10">
          <span className="text-2xl">🌌</span>
        </div>
      </div>
      <div className="absolute bottom-36 left-24 animate-[orbit_30s_linear_infinite] opacity-55">
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full p-3 backdrop-blur-sm border border-orange-400/30 shadow-xl shadow-orange-400/10">
          <span className="text-2xl">🪐</span>
        </div>
      </div>
      <div className="absolute bottom-24 right-8 animate-[orbit_15s_linear_infinite_reverse] opacity-45">
        <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-full p-3 backdrop-blur-sm border border-violet-400/30 shadow-xl shadow-violet-400/10">
          <span className="text-2xl">🌙</span>
        </div>
      </div>

      {/* Shooting stars */}
      <div className="absolute top-1/4 left-0 animate-[shootingStar_8s_ease-out_infinite_3s] opacity-70">
        <div className="w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"></div>
      </div>
      <div className="absolute top-3/4 right-0 animate-[shootingStar_12s_ease-out_infinite_6s] opacity-60">
        <div className="w-2 h-2 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50"></div>
      </div>
    </div>

    <div className="relative z-10 flex flex-col items-center max-w-6xl">
      <div className="mb-6 flex items-center justify-center">
        <div className="bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-full p-4 backdrop-blur-sm border border-indigo-400/40 mr-4 shadow-2xl shadow-indigo-500/20">
          <span className="text-4xl">🚀</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 animate-[fadeInDown_1s] drop-shadow-2xl">
          Cosmic Quest
        </h1>
      </div>

      <p className="text-xl md:text-2xl text-cyan-100 max-w-3xl mb-4 animate-[fadeInUp_1.5s] font-light drop-shadow-lg">
        Embark on an infinite journey through space and ideas
      </p>
      <p className="text-lg text-slate-300 max-w-2xl mb-12 animate-[fadeInUp_1.7s] drop-shadow-md">
        Navigate the cosmos of knowledge with AI as your stellar companion. Discover celestial wonders, unlock the mysteries of the universe, and let your curiosity guide you through the vast expanse of space.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mb-12 animate-[fadeIn_2s]">
        <div className="group bg-gradient-to-br from-indigo-900/60 to-blue-900/40 backdrop-blur-md p-8 rounded-2xl border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 hover:transform hover:scale-105 shadow-2xl shadow-blue-500/10">
          <div className="flex items-center mb-4">
            <div className="bg-cyan-500/30 rounded-full p-3 mr-3 group-hover:bg-cyan-500/50 transition-colors shadow-lg shadow-cyan-400/20">
              <span className="text-2xl">🛸</span>
            </div>
            <h3 className="text-xl font-semibold text-cyan-300">Space Exploration</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">Journey through galaxies, nebulae, and cosmic phenomena. Discover the wonders of planets, stars, and the infinite expanse of space.</p>
        </div>

        <div className="group bg-gradient-to-br from-purple-900/60 to-violet-900/40 backdrop-blur-md p-8 rounded-2xl border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:transform hover:scale-105 shadow-2xl shadow-purple-500/10">
          <div className="flex items-center mb-4">
            <div className="bg-purple-500/30 rounded-full p-3 mr-3 group-hover:bg-purple-500/50 transition-colors shadow-lg shadow-purple-400/20">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-semibold text-purple-300">Cosmic Intelligence</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">Get explanations tailored to your cosmic curiosity. Dive deeper into astrophysics or explore the fundamental forces that shape our universe.</p>
        </div>

        <div className="group bg-gradient-to-br from-emerald-900/60 to-teal-900/40 backdrop-blur-md p-8 rounded-2xl border border-emerald-400/30 hover:border-emerald-400/60 transition-all duration-300 hover:transform hover:scale-105 shadow-2xl shadow-emerald-500/10">
          <div className="flex items-center mb-4">
            <div className="bg-emerald-500/30 rounded-full p-3 mr-3 group-hover:bg-emerald-500/50 transition-colors shadow-lg shadow-emerald-400/20">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-emerald-300">Fact Verification</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">Cross-reference space information against scientific sources. Get accuracy assessments and confidence scores for reliable cosmic knowledge.</p>
        </div>
      </div>      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={onStart}
          className="group bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 text-white font-bold text-xl py-5 px-10 rounded-full shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 animate-[bounceIn_2.5s] relative overflow-hidden border border-cyan-400/30"
        >
          <span className="relative z-10 flex items-center">
            <span className="mr-3 text-2xl">🚀</span>
            Launch Into Space
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        <p className="text-sm text-slate-400 animate-[fadeIn_3s]">Begin your cosmic adventure</p>
      </div>
    </div>
  </div>
);


// --- Fact Checker Component ---
const FactChecker = ({ onBack }) => {
  const [originalQuery, setOriginalQuery] = useState('');
  const [answerToCheck, setAnswerToCheck] = useState('');
  const [factCheckResult, setFactCheckResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFactCheck = async (e) => {
    e.preventDefault();
    if (!originalQuery.trim() || !answerToCheck.trim()) {
      setError("Please provide both a query and an answer to fact-check.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFactCheckResult(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/fact-check', {
        original_query: originalQuery,
        answer_to_check: answerToCheck
      });
      setFactCheckResult(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || "Failed to perform fact check.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setOriginalQuery('');
    setAnswerToCheck('');
    setFactCheckResult(null);
    setError(null);
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white min-h-screen flex flex-col font-sans relative overflow-hidden">
      {/* Pure CSS space background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-purple-950/30 to-slate-950 opacity-90"></div>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                     radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                     radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.05) 0%, transparent 70%)`,
      }}></div>

      {/* Pure CSS twinkling stars */}
      <div className="absolute inset-0 opacity-60" style={{
        background: `radial-gradient(1px 1px at 25px 35px, #fff, transparent),
                     radial-gradient(1px 1px at 85px 45px, rgba(255,255,255,0.8), transparent),
                     radial-gradient(1px 1px at 165px 75px, #fff, transparent),
                     radial-gradient(1px 1px at 235px 25px, rgba(255,255,255,0.6), transparent),
                     radial-gradient(1px 1px at 305px 95px, #fff, transparent)`,
        animation: 'twinkle 3s ease-in-out infinite alternate',
      }}></div>

      {/* Animated stars */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 animate-[twinkle_3s_ease-in-out_infinite] opacity-60">
          <div className="w-1 h-1 bg-white rounded-full shadow-sm shadow-white/50"></div>
        </div>
        <div className="absolute top-20 right-20 animate-[twinkle_4s_ease-in-out_infinite_1s] opacity-50">
          <div className="w-1 h-1 bg-cyan-300 rounded-full shadow-sm shadow-cyan-300/50"></div>
        </div>
        <div className="absolute bottom-32 left-16 animate-[twinkle_5s_ease-in-out_infinite_2s] opacity-70">
          <div className="w-1 h-1 bg-purple-300 rounded-full shadow-sm shadow-purple-300/50"></div>
        </div>
        <div className="absolute bottom-16 right-32 animate-[twinkle_3.5s_ease-in-out_infinite_0.5s] opacity-55">
          <div className="w-1 h-1 bg-yellow-300 rounded-full shadow-sm shadow-yellow-300/50"></div>
        </div>
      </div>

      <header className="bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10 shadow-lg border-b border-indigo-500/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span className="text-xl">←</span>
            <span>Back to Chat</span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-green-500/30 to-emerald-600/30 rounded-full p-2 backdrop-blur-sm border border-green-400/30 shadow-lg shadow-green-500/20">
              <span className="text-2xl">🔍</span>
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 drop-shadow-lg">
              Cosmic Fact Checker
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6 overflow-y-auto w-full relative z-10 max-w-4xl">
        <div className="mb-8">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-400/30 shadow-xl">
            <h2 className="text-2xl font-bold text-emerald-300 mb-4 flex items-center">
              <span className="mr-3">🔬</span>
              Verify Scientific Information
            </h2>
            <p className="text-slate-300 mb-6">
              Cross-reference any space-related information against scientific sources including ArXiv papers and Wikipedia.
              Get detailed accuracy assessments with confidence scores and recommendations.
            </p>

            <form onSubmit={handleFactCheck} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  <span className="mr-2">❓</span>Original Query or Topic
                </label>
                <input
                  type="text"
                  value={originalQuery}
                  onChange={(e) => setOriginalQuery(e.target.value)}
                  placeholder="e.g., What is the distance to Andromeda Galaxy?"
                  className="w-full bg-slate-800/70 border border-emerald-500/30 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 backdrop-blur-sm text-slate-200 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  <span className="mr-2">📝</span>Answer or Information to Verify
                </label>
                <textarea
                  value={answerToCheck}
                  onChange={(e) => setAnswerToCheck(e.target.value)}
                  placeholder="Enter the information you want to fact-check..."
                  rows={6}
                  className="w-full bg-slate-800/70 border border-emerald-500/30 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 backdrop-blur-sm text-slate-200 placeholder-slate-400 resize-none"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading || !originalQuery.trim() || !answerToCheck.trim()}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-slate-600 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg border border-emerald-400/30"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white mr-2"></div>
                      Fact Checking...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">🔍</span>
                      Verify Information
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="bg-slate-700/80 hover:bg-slate-600/80 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg border border-slate-500/30"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && <ErrorDisplay message={error} />}

        {factCheckResult && (
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-400/30 shadow-xl">
            <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center">
              <span className="mr-3">📊</span>
              Fact Check Results
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className={`p-4 rounded-lg border ${factCheckResult.is_accurate
                ? 'bg-green-900/30 border-green-500/50'
                : 'bg-red-900/30 border-red-500/50'
                }`}>
                <h4 className="font-semibold mb-2 flex items-center">
                  <span className="mr-2">{factCheckResult.is_accurate ? '✅' : '❌'}</span>
                  Accuracy Assessment
                </h4>
                <p className={factCheckResult.is_accurate ? 'text-green-300' : 'text-red-300'}>
                  {factCheckResult.is_accurate ? 'Information appears accurate' : 'Issues found with accuracy'}
                </p>
              </div>

              <div className="p-4 rounded-lg border border-blue-500/50 bg-blue-900/30">
                <h4 className="font-semibold mb-2 flex items-center">
                  <span className="mr-2">📈</span>
                  Confidence Score
                </h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-slate-700 rounded-full h-3 mr-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${factCheckResult.confidence_score * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-blue-300 font-mono">
                    {(factCheckResult.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {factCheckResult.verified_facts && factCheckResult.verified_facts.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-green-300 mb-3 flex items-center">
                  <span className="mr-2">✅</span>
                  Verified Facts
                </h4>
                <ul className="space-y-2">
                  {factCheckResult.verified_facts.map((fact, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      <span className="text-slate-300">{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {factCheckResult.issues_found && factCheckResult.issues_found.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-red-300 mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Issues Found
                </h4>
                <ul className="space-y-2">
                  {factCheckResult.issues_found.map((issue, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-400 mr-2 mt-1">•</span>
                      <span className="text-slate-300">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {factCheckResult.recommendations && (
              <div className="mb-6">
                <h4 className="font-semibold text-cyan-300 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Recommendations
                </h4>
                <p className="text-slate-300 leading-relaxed">{factCheckResult.recommendations}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// --- Chat Interface Component ---
const ChatInterface = ({ onNavigateToFactChecker }) => {
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUserQuery, setLastUserQuery] = useState("");

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([{
      sender: 'agent',
      id: 'welcome-msg',
      text: '**Welcome aboard the Cosmic Quest!** 🚀\n\nI\'m your AI navigator, ready to guide you through the infinite expanse of space and knowledge. Whether you\'re curious about distant galaxies, the mysteries of black holes, stellar formations, or want to analyze celestial images, let\'s embark on this cosmic adventure together.\n\n*What corner of the universe shall we explore first?*',
      images: [],
      isActionable: false,
    }]);
  }, []);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewQuerySubmit = (queryText, imageFile = null, imageB64 = null) => {
    if (!queryText && !imageFile) {
      setError("Please enter a query or select an image.");
      return;
    }

    const userMessage = {
      sender: 'user',
      id: `user-${Date.now()}`,
      text: queryText,
      image: imageFile ? URL.createObjectURL(imageFile) : null,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setLastUserQuery(queryText); // Save the query as the topic
    setInputQuery('');
    setSelectedImage(null);
    setImageBase64(null);

    axios.post('http://127.0.0.1:8000/chat', { query: queryText, image_base64: imageB64 })
      .then(response => {
        if (response.data && typeof response.data.answer === 'string') {
          const agentResponse = {
            sender: 'agent',
            id: `agent-${Date.now()}`,
            text: response.data.answer,
            images: response.data.image_urls || [],
            isActionable: true,
          };
          setMessages(prev => [...prev, agentResponse]);
        } else {
          setError("The agent returned an unexpected response.");
        }
      })
      .catch(err => {
        const errorMessage = err.response?.data?.detail || err.message || "An unknown error occurred.";
        setError(`Failed to connect to the agent. ${errorMessage}`);
      })
      .finally(() => setIsLoading(false));
  };

  const handleActionClick = (actionType, topic) => {
    setIsLoading(true);
    setError(null);

    axios.post('http://127.0.0.1:8000/action', { action: actionType, topic: topic })
      .then(response => {
        if (actionType === 'suggest_questions') {
          const agentResponse = {
            sender: 'agent',
            id: `agent-action-${Date.now()}`,
            text: "Here are some stellar destinations for your next cosmic adventure:",
            suggestions: response.data.questions || [],
            isActionable: false
          };
          setMessages(prev => [...prev, agentResponse]);
        } else {
          const agentResponse = {
            sender: 'agent',
            id: `agent-action-${Date.now()}`,
            text: response.data.answer,
            images: [],
            isActionable: false, // Don't show actions on an action response
          };
          setMessages(prev => [...prev, agentResponse]);
        }
      })
      .catch(err => {
        const errorMessage = err.response?.data?.detail || "Failed to perform action.";
        setError(errorMessage);
      })
      .finally(() => setIsLoading(false));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleNewQuerySubmit(inputQuery, selectedImage, imageBase64);
  };

  const handleSuggestionClick = (question) => {
    handleNewQuerySubmit(question, null, null);
  };

  const createMarkup = (markdownText) => {
    const rawMarkup = marked.parse(markdownText || '');
    const sanitizedMarkup = DOMPurify.sanitize(rawMarkup);
    return { __html: sanitizedMarkup };
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white min-h-screen flex flex-col font-sans relative overflow-hidden">
      {/* Pure CSS space background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-purple-950/30 to-slate-950 opacity-90"></div>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                     radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                     radial-gradient(circle at 20% 90%, rgba(59, 130, 246, 0.05) 0%, transparent 70%)`,
      }}></div>

      {/* Pure CSS twinkling stars */}
      <div className="absolute inset-0 opacity-50" style={{
        background: `radial-gradient(1px 1px at 45px 55px, #fff, transparent),
                     radial-gradient(1px 1px at 125px 25px, rgba(255,255,255,0.8), transparent),
                     radial-gradient(1px 1px at 205px 85px, #fff, transparent),
                     radial-gradient(1px 1px at 285px 45px, rgba(255,255,255,0.6), transparent),
                     radial-gradient(1px 1px at 365px 75px, #fff, transparent)`,
        animation: 'twinkle 4s ease-in-out infinite alternate',
      }}></div>

      {/* Animated stars */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 animate-[twinkle_3s_ease-in-out_infinite] opacity-60">
          <div className="w-1 h-1 bg-white rounded-full shadow-sm shadow-white/50"></div>
        </div>
        <div className="absolute top-20 right-20 animate-[twinkle_4s_ease-in-out_infinite_1s] opacity-50">
          <div className="w-1 h-1 bg-cyan-300 rounded-full shadow-sm shadow-cyan-300/50"></div>
        </div>
        <div className="absolute bottom-32 left-16 animate-[twinkle_5s_ease-in-out_infinite_2s] opacity-70">
          <div className="w-1 h-1 bg-purple-300 rounded-full shadow-sm shadow-purple-300/50"></div>
        </div>
        <div className="absolute bottom-16 right-32 animate-[twinkle_3.5s_ease-in-out_infinite_0.5s] opacity-55">
          <div className="w-1 h-1 bg-yellow-300 rounded-full shadow-sm shadow-yellow-300/50"></div>
        </div>
      </div>

      <header className="bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10 shadow-lg border-b border-indigo-500/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-full p-2 backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-indigo-500/20">
              <span className="text-2xl">🚀</span>
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-lg">
              Cosmic Quest
            </h1>
          </div>
          <button
            onClick={onNavigateToFactChecker}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500/80 hover:to-green-500/80 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg border border-emerald-400/30"
          >
            <span className="text-lg">🔍</span>
            <span>Fact Checker</span>
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 overflow-y-auto w-full relative z-10">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'agent' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30 flex-shrink-0 border border-cyan-400/30">🌌</div>
                )}
                <div className={`max-w-2xl p-4 rounded-xl shadow-xl backdrop-blur-sm border ${msg.sender === 'user' ? 'bg-indigo-800/70 rounded-br-none border-cyan-400/30' : 'bg-slate-800/60 rounded-bl-none border-purple-400/30'}`}>
                  {msg.sender === 'user' && msg.text && <p className="whitespace-pre-wrap text-cyan-100">{msg.text}</p>}

                  {msg.sender === 'agent' && msg.text && (
                    <div
                      className="prose prose-invert prose-sm max-w-none prose-a:text-cyan-400 prose-a:hover:underline text-slate-200"
                      dangerouslySetInnerHTML={createMarkup(msg.text)}
                    />
                  )}

                  {msg.image && <img src={msg.image} alt="User upload" className="mt-3 rounded-lg max-h-60" />}

                  {msg.images && msg.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {msg.images.map((imgUrl, i) => (
                        <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer">
                          <img src={imgUrl} alt={`Agent response image ${i + 1}`} className="rounded-md hover:opacity-80 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  )}

                  {msg.fact_check && (
                    <div className="mt-4 p-4 bg-slate-900/60 rounded-lg border border-emerald-400/30">
                      <h4 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center">
                        <span className="mr-2">🔍</span>
                        Fact Check Results
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className={`flex items-center ${msg.fact_check.is_accurate ? 'text-green-300' : 'text-red-300'}`}>
                          <span className="mr-2">{msg.fact_check.is_accurate ? '✅' : '❌'}</span>
                          {msg.fact_check.is_accurate ? 'Verified' : 'Issues Found'}
                        </div>
                        <div className="flex items-center text-blue-300">
                          <span className="mr-2">📊</span>
                          {(msg.fact_check.confidence_score * 100).toFixed(1)}% confidence
                        </div>
                      </div>
                      {msg.fact_check.recommendations && (
                        <p className="mt-2 text-xs text-slate-400">{msg.fact_check.recommendations}</p>
                      )}
                    </div>
                  )}

                  {msg.suggestions && (
                    <div className="mt-4 flex flex-col items-start gap-2">
                      <p className="text-sm text-cyan-300 mb-2">🌟 Stellar destinations to explore:</p>
                      {msg.suggestions.map((q, i) => (
                        <button key={i} onClick={() => handleSuggestionClick(q)} className="bg-gradient-to-r from-slate-700/60 to-indigo-700/60 hover:from-slate-600/80 hover:to-indigo-600/80 text-left text-sm p-3 rounded-lg transition-all duration-200 border border-indigo-500/30 hover:border-cyan-400/60 transform hover:scale-[1.02] shadow-lg backdrop-blur-sm">
                          <span className="text-cyan-300">🔎 </span> {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/30 flex-shrink-0 border border-cyan-400/30">🧑‍🚀</div>
                )}
              </div>

              {msg.isActionable && !isLoading && (
                <div className="flex justify-start items-center gap-2 ml-14 mt-2">
                  <button onClick={() => handleActionClick('eli5', lastUserQuery)} className="text-xs bg-gradient-to-r from-emerald-800/80 to-teal-700/80 hover:from-emerald-700/80 hover:to-teal-600/80 px-3 py-1.5 rounded-full transition-all duration-200 border border-emerald-600/30 hover:border-emerald-500/50 shadow-lg backdrop-blur-sm">
                    🌟 Simplify This Knowledge
                  </button>
                  <button onClick={() => handleActionClick('deep_dive', lastUserQuery)} className="text-xs bg-gradient-to-r from-indigo-800/80 to-purple-700/80 hover:from-indigo-700/80 hover:to-purple-600/80 px-3 py-1.5 rounded-full transition-all duration-200 border border-indigo-600/30 hover:border-indigo-500/50 shadow-lg backdrop-blur-sm">
                    🔭 Deep Space Exploration
                  </button>
                  <button onClick={() => handleActionClick('suggest_questions', lastUserQuery)} className="text-xs bg-gradient-to-r from-purple-800/80 to-pink-700/80 hover:from-purple-700/80 hover:to-pink-600/80 px-3 py-1.5 rounded-full transition-all duration-200 border border-purple-600/30 hover:border-purple-500/50 shadow-lg backdrop-blur-sm">
                    🌌 Related Cosmic Mysteries
                  </button>
                </div>
              )}
            </div>
          ))}
          {isLoading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} />}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="bg-slate-900/70 backdrop-blur-sm sticky bottom-0 p-4 border-t border-indigo-500/30 z-10">
        <form onSubmit={handleSubmit} className="container mx-auto flex items-center gap-4">
          <input type="file" accept="image/*" onChange={handleImageSelect} ref={fileInputRef} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current.click()} className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold p-3 rounded-full transition-all duration-200 shadow-lg border border-cyan-400/30" title="Select an astronomical image">🖼️</button>
          <div className="relative flex-grow">
            {selectedImage && (
              <div className="absolute bottom-12 left-0 bg-slate-900/90 p-1 rounded-lg border border-cyan-400/30 backdrop-blur-sm">
                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-10 w-10 object-cover rounded" />
                <button type="button" onClick={() => { setSelectedImage(null); setImageBase64(null); }} className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center transition-colors">×</button>
              </div>
            )}
            <input type="text" value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} placeholder="What cosmic mysteries shall we explore..." className="w-full bg-slate-800/70 border border-indigo-500/30 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 backdrop-blur-sm text-slate-200 placeholder-slate-400" disabled={isLoading} />
          </div>
          <button type="submit" disabled={isLoading || (!inputQuery && !selectedImage)} className="flex-shrink-0 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-5 rounded-full transition-all duration-200 shadow-lg border border-cyan-400/30">🚀</button>
        </form>
      </footer>
    </div>
  );
}

// --- Main App Component ---
function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'chat', 'factChecker'

  const handleStartChat = () => setCurrentView('chat');
  const handleNavigateToFactChecker = () => setCurrentView('factChecker');
  const handleBackToChat = () => setCurrentView('chat');

  if (currentView === 'landing') {
    return <LandingPage onStart={handleStartChat} />;
  } else if (currentView === 'chat') {
    return <ChatInterface onNavigateToFactChecker={handleNavigateToFactChecker} />;
  } else if (currentView === 'factChecker') {
    return <FactChecker onBack={handleBackToChat} />;
  }

  return <LandingPage onStart={handleStartChat} />;
}

export default App;
