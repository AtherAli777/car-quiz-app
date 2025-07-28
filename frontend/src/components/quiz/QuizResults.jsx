import React, { useState, useEffect } from 'react';
import { carQuizApi } from '../../services/api';

const QuizResults = ({ 
  onResultsFetched,
  onShowLeadForm,
  quizAnswers = {},
  searchParams = null,
  isLeadCaptured = false,
  showBlurred = false,
  onRetakeQuiz
}) => {
  // Your debug code
  console.log('🔍 QuizResults received:', {
    searchParams,
    hasSearchParams: !!searchParams,
    dataSource: searchParams?.data_source,
    searchParamsKeys: searchParams ? Object.keys(searchParams) : 'null'
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  // ✅ RESET hasAttempted when searchParams change
  useEffect(() => {
    setHasAttempted(false);
  }, [searchParams]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // ✅ Handle direct search first - BEFORE any other checks
        if (searchParams && searchParams.data_source === 'direct_search') {
          console.log('📋 Using direct search results');
          setResults(searchParams);
          
          if (onResultsFetched && typeof onResultsFetched === 'function') {
            onResultsFetched(searchParams);
          }
          
          setLoading(false);
          return;
        }

        // ✅ PREVENT MULTIPLE CALLS - Only for quiz, not direct search
        if (hasAttempted) {
          console.log('🛑 Already attempted, skipping...');
          return;
        }
        setHasAttempted(true);

        // Original quiz logic
        console.log('🎯 Original quiz answers:', quizAnswers);
        
        if (!quizAnswers || Object.keys(quizAnswers).length < 6) {
          console.error('❌ Missing quiz answers:', quizAnswers);
          setError('Please complete all quiz questions');
          setLoading(false);
          return;
        }
                
        // Rest of your existing quiz logic...
        const requestData = {
          body_type: quizAnswers[1] || quizAnswers.bodyType || 'SUV',
          budget_range: quizAnswers[2] || quizAnswers.budget || '',
          seats_needed: quizAnswers[3] || quizAnswers.seats || '',
          vehicle_quality: quizAnswers[4] || quizAnswers.quality || '',
          fuel_preference: quizAnswers[5] || quizAnswers.fuel || '',
          timeframe: quizAnswers[6] || quizAnswers.timeframe || 'Within 6 months'
        };

        console.log('📤 Sending to API:', requestData);
                
        const response = await carQuizApi.submitQuiz(requestData);
        console.log('✅ API Response:', response);
                
        if (response.data && response.data.success && response.data.data) {
          const resultsData = response.data.data;
          if (resultsData.matches) {
            resultsData.matches = resultsData.matches.map(car => ({
              ...car,
              match_percentage: car.match_score || car.match_percentage
            }));
          }
          
          setResults(resultsData);
          setError(null);

          if (onResultsFetched && typeof onResultsFetched === 'function') {
            onResultsFetched(resultsData);
          }
        } else {
          setError('Invalid response format from server');
        }
      } catch (error) {
        console.error('❌ Error fetching quiz results:', error);
        setError('Failed to get results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizAnswers, searchParams]); // ✅ Keep both dependencies

  // Rest of your component...

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Finding Your Perfect Cars</h2>
          <p className="text-gray-300">Analyzing your preferences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center text-white max-w-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-red-400">Connection Issue</h2>
          <p className="text-gray-300 mb-4">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
          <p className="text-sm text-gray-400 mb-6">
            The backend API may be running but there could be a data format issue.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.open('http://localhost:8000/docs', '_blank')}
              className="bg-slate-600 hover:bg-slate-500 px-6 py-3 rounded-lg transition-colors"
            >
              Check API
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">

          {/* Home Button */}
          <div className="mb-8">
            <button 
              onClick={() => window.location.href = '/'}
              className="text-gray-400 hover:text-white inline-flex items-center transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">🎯</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Perfect Car Matches
          </h1>
          <p className="text-gray-300 text-lg">
            Based on your quiz responses, we've found the ideal cars for you!
          </p>
        </div>

        {/* Car Results */}
        {results && results.matches && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {results.matches.slice(0, 2).map((car, index) => (
              <div 
                key={index}
                className={`relative bg-slate-800/50 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  isLeadCaptured 
                    ? 'border-purple-500/50 shadow-lg' 
                    : 'border-slate-600'
                }`}
              >
                {/* Blur overlay if lead not captured */}
                {!isLeadCaptured && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/50 z-10 flex items-center justify-center">
                    <div className="text-center text-white p-6">
                      <div className="text-4xl mb-4">🔒</div>
                      <h3 className="text-xl font-bold mb-2">Complete Your Details</h3>
                      <p className="text-gray-300 text-sm">
                        Enter your information below to reveal your car matches
                      </p>
                    </div>
                  </div>
                )}

                {/* Car Image - WITH REAL IMAGES! */}
                <div className="aspect-video bg-gradient-to-r from-purple-500/20 to-coral-500/20 flex items-center justify-center relative">
                  {car.image_url ? (
                    <img 
                      src={car.image_url} 
                      alt={`${car.brand} ${car.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback placeholder */}
                  <div 
                    className={`text-center text-white absolute inset-0 flex items-center justify-center ${
                      car.image_url ? 'hidden' : 'flex'
                    }`}
                  >
                    <div>
                      <div className="text-6xl mb-2">🚗</div>
                      <div className="text-lg font-semibold">{car.brand}</div>
                      <div className="text-sm text-gray-300">{car.name}</div>
                    </div>
                  </div>

                  {/* Image overlay */}
                  {car.image_url && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="text-white">
                        <div className="text-lg font-semibold">{car.brand}</div>
                        <div className="text-sm text-gray-300">{car.name}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Match Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold z-20">
                    {car.match_percentage}% Match
                  </div>
                </div>

                {/* Car Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{car.name}</h3>
                      <p className="text-purple-400 font-semibold">{car.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-coral-400 font-bold text-lg">{car.price_range}</p>
                    </div>
                  </div>

                  {/* Car Specs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase">Fuel</p>
                      <p className="text-white font-semibold text-sm">{car.fuel_type}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase">Body</p>
                      <p className="text-white font-semibold text-sm">{car.body_type}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase">Seats</p>
                      <p className="text-white font-semibold text-sm">{car.seats}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase">Stock</p>
                      <p className="text-green-400 font-semibold text-sm">{car.stock_level}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Explanation */}
        {isLeadCaptured && results && results.explanation && (
          <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 border border-slate-600">
            <div className="flex items-start">
              <div className="text-4xl mr-4">🤖</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Why These Cars?</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {results.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!isLeadCaptured && (
          <div className="text-center">
            <button
              onClick={onShowLeadForm}
              className="bg-gradient-to-r from-purple-500 to-coral-500 hover:from-purple-600 hover:to-coral-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔓 Reveal My Car Matches
            </button>
            <p className="text-gray-400 mt-4 text-sm">
              Enter your details to see complete results and get personalized assistance
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuizResults;