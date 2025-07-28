import React from 'react';

const QuizStart = ({ onStart, quizType, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full text-center">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="text-gray-400 hover:text-white mb-8 inline-flex items-center transition-colors"
        >
          ← Back to home
        </button>

        {/* Logo */}
        <div className="mb-8">
          <div className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-coral-400 bg-clip-text text-transparent">
              book
            </span>
            <span className="text-white mx-2">📍</span>
            <span className="bg-gradient-to-r from-coral-400 via-purple-500 to-lavender-400 bg-clip-text text-transparent">
              testdrive
            </span>
          </div>
        </div>

        {/* Content based on quiz type */}
        {quizType === 'direct-search' ? (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Tell us what you're looking for
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
              Help us find the specific make and model you have in mind. We'll connect you with the right dealer and get you the best deal.
            </p>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center text-purple-400 mb-3">
                <span className="text-2xl mr-2">🎯</span>
                <span className="font-semibold">Direct Search</span>
              </div>
              <p className="text-gray-300 text-sm">
                You'll provide the make, model, and any specific requirements
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Find Your Perfect Car Match
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
              Answer 5 quick questions and we'll recommend the best cars for your lifestyle, budget, and needs.
            </p>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center text-coral-400 mb-3">
                <span className="text-2xl mr-2">🧭</span>
                <span className="font-semibold">Car Discovery Quiz</span>
              </div>
              <p className="text-gray-300 text-sm">
                Takes about 2 minutes • Get personalized recommendations
              </p>
            </div>
          </>
        )}

        {/* Start Button - Using regular button instead of Button component */}
        <button
          onClick={onStart}
          className="bg-gradient-to-r from-purple-500 to-coral-500 hover:from-purple-600 hover:to-coral-600 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg w-full md:w-auto"
        >
          {quizType === 'direct-search' ? 'Start Search' : 'Start Quiz'} →
        </button>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="text-gray-400">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-sm">Quick & Easy</div>
          </div>
          <div className="text-gray-400">
            <div className="text-2xl mb-2">🤖</div>
            <div className="text-sm">AI-Powered</div>
          </div>
          <div className="text-gray-400">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm">Personalized</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizStart;