import React from 'react';

const QuizQuestion = ({ 
  question, 
  answer, 
  onAnswerSelect, 
  onNext, 
  onPrevious, 
  currentIndex, 
  totalQuestions, 
  canGoBack, 
  canGoNext 
}) => {
  const handleOptionSelect = (option) => {
    onAnswerSelect(question.id, option.value);
  };

  // Debug: Log the question to see what we're getting
  console.log('Current question:', question);
  console.log('Question options:', question?.options);

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        
        {/* Question Header */}
        <div className="text-center mb-12">
          <div className="text-sm text-gray-400 mb-4">
            Question {currentIndex + 1} of {totalQuestions}
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8 leading-tight">
            {question.question}
          </h1>
        </div>

        {/* Answer Options */}
        {question.options && question.options.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                className={`group p-6 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 transform ${
                  answer === option.value
                    ? 'border-purple-500 bg-purple-500/20 text-white shadow-lg shadow-purple-500/25'
                    : 'border-slate-600 bg-slate-800/50 text-gray-300 hover:border-purple-400 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-4 flex-shrink-0 transition-all ${
                    answer === option.value
                      ? 'border-purple-400 bg-purple-500'
                      : 'border-gray-400 group-hover:border-purple-400'
                  }`}>
                    {answer === option.value && (
                      <div className="w-full h-full rounded-full bg-white scale-50 transition-all"></div>
                    )}
                  </div>
                  <span className="text-lg font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center mb-12">
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-red-300">
              <p>⚠️ No options found for this question</p>
              <p className="text-sm mt-2">Question ID: {question.id}</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={!canGoBack}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              canGoBack
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            ← Previous
          </button>

          <div className="text-gray-400 text-sm">
            {currentIndex + 1} / {totalQuestions}
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              canGoNext
                ? 'bg-gradient-to-r from-purple-500 to-coral-500 hover:from-purple-600 hover:to-coral-600 text-white shadow-lg transform hover:scale-105'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {currentIndex === totalQuestions - 1 ? 'Complete Quiz' : 'Next'} →
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i < currentIndex 
                    ? 'bg-green-500' 
                    : i === currentIndex 
                    ? 'bg-purple-500' 
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestion;