import React, { useState } from 'react';

const LeadForm = ({ quizAnswers, carMatches, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContact: 'Email',
    comments: ''
  });
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Create a complete QuizSubmission object matching the backend model
      const formattedQuizAnswers = {
        body_type: quizAnswers[1] || 'SUV',           // Question 1
        budget_range: quizAnswers[2] || '$35k-$50k',  // Question 2
        seats_needed: quizAnswers[3] || '5',          // Question 3
        vehicle_quality: quizAnswers[4] || 'Premium', // Question 4
        fuel_preference: quizAnswers[5] || 'Petrol',  // Question 5
        timeframe: quizAnswers[6] || 'Within 1 month' // Question 6
      };

    // Ensure carMatches are properly formatted as CarMatch objects
    const selectedCars = carMatches && carMatches.length > 0 ? carMatches.map(car => ({
      name: car.name || 'Unknown Car',
      brand: car.brand || 'Unknown Brand',
      price_range: car.price_range || 'Contact for pricing',
      match_percentage: car.match_percentage || car.match_score || 85,
      stock_level: car.stock_level || 'Available',
      fuel_type: car.fuel_type || 'Petrol',
      body_type: car.body_type || 'Car',
      seats: car.seats || '5',
      image_url: car.image_url || '',
      vehicle_quality: car.vehicle_quality || 'Premium',
      weekly_repayment: car.weekly_repayment || 'Contact for quote'
    })) : [
      {
        name: "Ford Ranger",
        brand: "Ford",
        price_range: "Contact for pricing",
        match_percentage: 95,
        stock_level: "Available",
        fuel_type: "Petrol",
        body_type: "Ute",
        seats: "5",
        image_url: "",
        vehicle_quality: "Premium",
        weekly_repayment: "Contact for quote"
      }
    ];

    const requestData = {
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      quiz_answers: formattedQuizAnswers, // This now matches QuizSubmission model
      selected_cars: selectedCars,        // This now matches CarMatch model
      preferred_contact_method: formData.preferredContact,
      additional_comments: formData.comments,
      broker_name: 'Direct',
      broker_email: null
    };

    console.log('📤 Sending to API:', requestData);

    // Submit to backend
    const response = await fetch('http://localhost:8000/api/leads/capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Lead captured successfully:', result);
      onSubmit(formData);
    } else {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      alert(`Error submitting form: ${errorData.detail || 'Please try again.'}`);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
    alert('Error submitting form. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📋</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Complete Your Details
          </h1>
          <p className="text-gray-300">
            Enter your information to reveal your perfect car matches and get personalized assistance
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-600">
          
          {/* Name */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Enter your email address"
            />
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Preferred Contact */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Preferred Contact Method
            </label>
            <select
              value={formData.preferredContact}
              onChange={(e) => setFormData({...formData, preferredContact: e.target.value})}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="Either">Either</option>
            </select>
          </div>

          {/* Comments */}
          <div className="mb-8">
            <label className="block text-white font-semibold mb-2">
              Additional Comments
            </label>
            <textarea
              rows={4}
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Any additional information or special requirements..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-coral-500 hover:from-purple-600 hover:to-coral-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Submitting...' : '🔓 Reveal My Perfect Cars'}
          </button>

          <p className="text-gray-400 text-sm text-center mt-4">
            Your information is secure and will only be used to provide car recommendations
          </p>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;