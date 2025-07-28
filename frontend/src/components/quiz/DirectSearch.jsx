import React, { useState, useEffect } from 'react';

const DirectSearch = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    lookingFor: 'New Vehicle',
    make: '',
    model: '',
    comments: ''
  });
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch all makes when component loads
  useEffect(() => {
    fetchMakes();
  }, []);

  // Fetch models when make changes
  useEffect(() => {
    if (formData.make) {
      fetchModels(formData.make);
    } else {
      setModels([]);
      setFormData(prev => ({ ...prev, model: '' }));
    }
  }, [formData.make]);

  const fetchMakes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cars/makes');
      if (response.ok) {
        const result = await response.json();
        setMakes(result.data.makes || []);
      }
    } catch (error) {
      console.error('Error fetching makes:', error);
      // Fallback makes if API fails
      setMakes(['Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Hyundai', 'Kia', 'Honda', 'Mazda', 'Subaru']);
    }
  };

  const fetchModels = async (make) => {
    setLoadingModels(true);
    try {
      const response = await fetch(`http://localhost:8000/api/cars/models?make=${encodeURIComponent(make)}`);
      if (response.ok) {
        const result = await response.json();
        setModels(result.data.models || []);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

// In DirectSearch.jsx - handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.make || !formData.model) {
    alert('Please select both make and model');
    return;
  }

  setLoading(true);
  
  try {
    const response = await fetch('http://localhost:8000/api/cars/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        make: formData.make,
        model: formData.model,
        looking_for: formData.lookingFor,
        additional_comments: formData.comments
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      // ✅ CRITICAL: Format the response correctly
      const formattedResult = {
        matches: result.data.cars || [],
        explanation: `Based on your search for ${formData.make} ${formData.model}, we found these available options that match your criteria.`,
        total_matches: result.data.cars?.length || 0,
        data_source: "direct_search", // ✅ Make sure this is set
        quiz_answers: {
          budget_range: "Not specified",
          vehicle_quality: "Any",
          fuel_preference: "Any",
          seats_needed: "Any",
          body_type: "Any",
          timeframe: "Ready now"
        },
        search_params: {
          make: formData.make,
          model: formData.model,
          looking_for: formData.lookingFor,
          comments: formData.comments
        }
      };
      
      console.log('🚗 DirectSearch formatted result:', formattedResult);
      console.log('🔍 About to call onSubmit with data_source:', formattedResult.data_source);
      onSubmit(formattedResult); // ✅ This should pass to QuizResults
    } else {
      const errorData = await response.json();
      alert(`Search failed: ${errorData.detail || 'Please try again'}`);
    }
  } catch (error) {
    console.error('Search error:', error);
    alert('Search failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="text-white text-center max-w-2xl w-full">
        <button 
          onClick={onBack}
          className="text-gray-400 hover:text-white mb-8 inline-flex items-center transition-colors"
        >
          ← Back to home
        </button>
        
        <h2 className="text-3xl font-bold mb-6">Direct Car Search</h2>
        <p className="text-gray-300 mb-8 text-lg">
          Select the specific make and model you're looking for and we'll connect you with available options.
        </p>
        
        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-left">
          <div className="text-purple-400 text-6xl mb-4 text-center">🚗</div>
          <h3 className="text-xl font-semibold mb-2 text-center">Make & Model Selection</h3>
          <p className="text-gray-400 mb-6 text-center">Choose from our inventory of available vehicles</p>
          
          {/* Looking for */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Looking for</label>
              <select 
                value={formData.lookingFor}
                onChange={(e) => setFormData(prev => ({ ...prev, lookingFor: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="New Vehicle">New Vehicle</option>
                <option value="Used Vehicle">Used Vehicle</option>
              </select>
            </div>
            
            {/* Make */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Make</label>
              <select 
                value={formData.make}
                onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                required
              >
                <option value="">Select Make...</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>
            
            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
              <select 
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                required
                disabled={!formData.make || loadingModels}
              >
                <option value="">
                  {!formData.make ? 'Select Make First...' : 
                   loadingModels ? 'Loading Models...' : 
                   'Select Model...'}
                </option>
                {models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            
            {/* Additional Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Additional Comments</label>
              <textarea 
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                rows="3"
                placeholder="e.g. approval amount, specific requirements..."
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.make || !formData.model}
              className="w-full bg-gradient-to-r from-purple-500 to-coral-500 hover:from-purple-600 hover:to-coral-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin mr-2">🔍</div>
                  Searching...
                </div>
              ) : (
                'Find Available Options'
              )}
            </button>
          </div>
        </form>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 text-gray-400 hover:text-white transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default DirectSearch;