import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QUIZ_QUESTIONS } from '../utils/constants';
import QuizStart from '../components/quiz/QuizStart';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizResults from '../components/quiz/QuizResults';
import LeadForm from '../components/quiz/LeadForm';
import DirectSearch from '../components/quiz/DirectSearch';

const QuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizType, setQuizType] = useState('quiz');
  const [quizResults, setQuizResults] = useState(null);
  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [carMatches, setCarMatches] = useState([]);

  useEffect(() => {
    const pathType = localStorage.getItem('carQuiz_userPath') || location.state?.type || 'quiz';
    setQuizType(pathType);
    
    // Get broker info from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const broker = urlParams.get('broker');
    if (broker) {
      localStorage.setItem('carQuiz_brokerInfo', JSON.stringify({ name: broker }));
    }
  }, [location]);

  const handleStartQuiz = () => {
    if (quizType === 'direct-search') {
      setCurrentStep('direct-search');
    } else {
      setCurrentStep('question');
      setCurrentQuestionIndex(0);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz completed, show blurred results
      setCurrentStep('results');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setCurrentStep('start');
    }
  };

  const handleShowLeadForm = () => {
    // This is triggered when user wants to see results
    // Show the lead form to capture details
    setCurrentStep('lead-form');
  };

const handleLeadSubmit = async (submittedLeadData) => {
  setLoading(true);
  setLeadData(submittedLeadData);
  
  try {
    // Get quiz results first if we don't have them
    if (!quizResults) {
      const response = await fetch('http://localhost:8000/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body_type: answers[1],
          budget_range: answers[2],
          seats_needed: answers[3], 
          vehicle_quality: answers[4],
          fuel_preference: answers[5],
          timeframe: answers[6]
        })
      });

      if (response.ok) {
        const results = await response.json();
        setQuizResults(results.data);
      }
    }
    
    // Now proceed to final results
    setCurrentStep('final-results');
    
  } catch (error) {
    console.error('Error:', error);
    setCurrentStep('final-results');
  } finally {
    setLoading(false);
  }
};

  const handleRetakeQuiz = () => {
    setCurrentStep('start');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizResults(null);
    setLeadData(null);
  };

  const progress = currentStep === 'question' ? 
    ((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100 : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold mb-2">Finding Your Perfect Matches</h2>
          <p className="text-gray-300">Analyzing your preferences...</p>
        </div>
      </div>
    );
  }

  // START SCREEN
  if (currentStep === 'start') {
    return (
      <QuizStart 
        onStart={handleStartQuiz}
        quizType={quizType}
        onBack={() => navigate('/')}
      />
    );
  }

  // DIRECT SEARCH SCREEN

if (currentStep === 'direct-search') {
  return (
    <DirectSearch 
      onSubmit={(searchResults) => {
        // Set the search results to display
        console.log('🎯 QuizPage received search results:', searchResults);
        console.log('🔍 Search results data_source:', searchResults?.data_source);
        setQuizResults(searchResults);
        setCurrentStep('results');
      }}
      onBack={() => navigate('/')}
    />
  );
}

  // QUESTION SCREEN
  if (currentStep === 'question') {
    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-coral-500 h-2 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <QuizQuestion
          question={currentQuestion}
          answer={currentAnswer}
          onAnswerSelect={handleAnswerSelect}
          onNext={handleNextQuestion}
          onPrevious={handlePreviousQuestion}
          currentIndex={currentQuestionIndex}
          totalQuestions={QUIZ_QUESTIONS.length}
          canGoBack={currentQuestionIndex > 0}
          canGoNext={currentAnswer !== undefined}
        />
      </div>
    );
  }

  // RESULTS SCREEN (Blurred - Lead form required)
if (currentStep === 'results') {
  // ✅ ADD DEBUG HERE
  console.log('🔍 QuizResults about to render with:', {
    quizResults,
    hasQuizResults: !!quizResults,
    dataSource: quizResults?.data_source
  });

  return (
    <QuizResults 
      quizAnswers={answers}
      onShowLeadForm={handleShowLeadForm}
      onResultsFetched={(results) => setCarMatches(results.matches || [])}
      isLeadCaptured={false}
      showBlurred={true}
      searchParams={quizResults}  // This should contain data_source: 'direct_search'
    />
  );
}

  // LEAD FORM SCREEN
if (currentStep === 'lead-form') {
  return (
    <LeadForm 
      quizAnswers={answers}
      carMatches={carMatches} // Pass actual car matches
      onSubmit={handleLeadSubmit}
      onBack={() => setCurrentStep('results')}
    />
  );
}

  // FINAL RESULTS (After lead capture - unblurred)
  if (currentStep === 'final-results') {
    return (
      <QuizResults 
        quizAnswers={answers}
        quizResults={quizResults}
        leadData={leadData}
        onShowLeadForm={() => {}} // No action needed
        onResultsFetched={() => {}}
        isLeadCaptured={true}
        showBlurred={false}
        onRetakeQuiz={handleRetakeQuiz}
        searchParams={quizResults}
      />
    );
  }

  // FALLBACK
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Loading Quiz...</h1>
        <div className="animate-spin text-4xl mb-4">🚗</div>
        <button 
          onClick={() => navigate('/')}
          className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default QuizPage;