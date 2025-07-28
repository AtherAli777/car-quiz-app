import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND_COLORS, APP_CONFIG } from '../utils/constants';

const HomePage = () => {
  const navigate = useNavigate();
  const [brokerInfo, setBrokerInfo] = useState(null);

  // Extract broker info from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const broker = urlParams.get('broker');
    if (broker) {
      setBrokerInfo({ name: broker, source: 'url_param' });
      // Store broker info for tracking
      localStorage.setItem('carQuiz_brokerInfo', JSON.stringify({ name: broker }));
    }
  }, []);

  const handleKnowWhatTheyWant = () => {
    // Store the choice and navigate to lead form with direct search context
    localStorage.setItem('carQuiz_userPath', 'direct-search');
    navigate('/quiz', { state: { type: 'direct-search' } });
  };

  const handleTakeQuiz = () => {
    // Store the choice and navigate to quiz
    localStorage.setItem('carQuiz_userPath', 'quiz');
    navigate('/quiz', { state: { type: 'quiz' } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-coral-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-lavender-500 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        
        {/* Logo/Branding Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            {/* Logo - using text for now, can replace with actual logo later */}
            <div className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-coral-400 bg-clip-text text-transparent">
                book
              </span>
              <span className="text-white mx-2">📍</span>
              <span className="bg-gradient-to-r from-coral-400 via-purple-500 to-lavender-400 bg-clip-text text-transparent">
                testdrive
              </span>
            </div>
          </div>
          <div className="text-lg md:text-xl text-gray-300 font-medium">
            .com.au
          </div>
        </div>

        {/* Main Question */}
        <div className="text-center mb-12 max-w-3xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Does the customer know what they are looking for?
          </h1>
          <p className="text-gray-300 text-lg md:text-xl">
            Choose the option that best describes your situation
          </p>
        </div>

        {/* Two Path Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl">
          
          {/* Option A: Know What They Want */}
          <div 
            onClick={handleKnowWhatTheyWant}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
          >
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 h-full hover:border-purple-500/50 transition-all duration-300">
              
              {/* Image Container */}
              <div className="mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-coral-500/20 to-purple-500/20 p-6">
                <div className="w-full h-32 bg-gradient-to-r from-coral-500/30 to-purple-500/30 rounded-lg flex items-center justify-center">
                  <div className="text-6xl">🏙️</div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-red-500 rounded-full mb-4">
                  <span className="text-white font-bold text-lg">✓</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                  Yes, lets pick their Make/Model
                </h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  I know exactly what car I'm looking for. Help me find specific makes and models.
                </p>
              </div>

              {/* Hover Effect */}
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                  <span className="text-purple-300 text-sm font-medium">Click to search specific cars →</span>
                </div>
              </div>
            </div>
          </div>

          {/* Option B: Take Quiz */}
          <div 
            onClick={handleTakeQuiz}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
          >
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 h-full hover:border-purple-500/50 transition-all duration-300">
              
              {/* Image Container */}
              <div className="mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-coral-500/20 p-6">
                <div className="w-full h-32 bg-gradient-to-r from-purple-500/30 to-coral-500/30 rounded-lg flex items-center justify-center">
                  <div className="text-6xl">🙋‍♀️</div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-red-500 rounded-full mb-4">
                  <span className="text-white font-bold text-lg">✓</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                  No and we need a hand
                </h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  I'm not sure what car would be best for me. Take a quick quiz to find my perfect match.
                </p>
              </div>

              {/* Hover Effect */}
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                  <span className="text-purple-300 text-sm font-medium">Take the car quiz →</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Button (Style Reference) */}
        {/* <div className="mt-12">
          <button className="bg-gradient-to-r from-purple-500 to-coral-500 hover:from-purple-600 hover:to-coral-600 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg opacity-60 cursor-not-allowed">
            Next →
          </button>
        </div> */}

        {/* Broker Attribution (if present) */}
        {brokerInfo && (
          <div className="absolute bottom-4 right-4 text-xs text-gray-500">
            Partner: {brokerInfo.name}
          </div>
        )}

        {/* Lead Indicators */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 hidden lg:block">
          <div className="text-red-500 font-bold text-2xl transform -rotate-12">
            QUIZ
          </div>
        </div>
        
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 hidden lg:block">
          <div className="text-red-500 font-bold text-2xl transform rotate-12">
            LEAD →
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;