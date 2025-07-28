// Quiz Questions and Options
export const QUIZ_QUESTIONS = [
    {
    id: 1,  // NEW QUESTION
    question: "What type of car are you leaning towards?",
    type: "single",
    options: [
      { value: "Sedan", label: "Sedan" },
      { value: "SUV", label: "SUV" },
      { value: "Hatchback", label: "Hatchback" },
      { value: "Sports", label: "Sports" },
      { value: "Ute", label: "Ute" },
      { value: "People Mover", label: "People Mover" },
      { value: "Wagon", label: "Wagon" },
      { value: "Van", label: "Van" },
      { value: "Convertible", label: "Convertible" }
    ]
  },
  {
    id: 2,
    question: "What's your budget range?",
    type: "single",
    options: [
      { value: "Under $25k", label: "Under $25k – Entry-level or first car" },
      { value: "$25k-$35k", label: "$25k-$35k – Value small car or compact SUV" },
      { value: "$35k-$50k", label: "$35k-$50k – Budget-friendly family vehicle" },
      { value: "$50k-$70k", label: "$50k-$70k – High-spec SUV or trade-ready ute" },
      { value: "$70k-$100k", label: "$70k-$100k – Entry-level luxury or premium family" },
      { value: "$100k+", label: "$100k+ – Top-end, performance or prestige" },
    ],
  },
  {
    id: 3,
    question: "How many seats do you need?",
    type: "single",
    options: [
      { value: "Up to 5 is fine", label: "Up to 5 is fine – Perfect for couples, small families, or commuting" },
      { value: "6+ seats", label: "6+ seats – Large family, regular passengers, or extra cargo space" },
    ],
  },
  {
    id: 4,
    question: "What level of vehicle quality or brand are you after?",
    type: "single",
    options: [
      { value: "Everyday", label: "Everyday – Reliable, practical, great value (Toyota, Mazda, Hyundai)" },
      { value: "Premium", label: "Premium – Higher-spec features, better materials (Subaru, Volkswagen)" },
      { value: "Luxury", label: "Luxury – Top-tier brands, premium experience (BMW, Mercedes, Audi)" },
    ],
  },
  {
    id: 5,
    question: "What type of fuel or powertrain do you prefer?",
    type: "single",
    options: [
      { value: "Petrol, Diesel, or Hybrid (no plug-in)", label: "Petrol, Diesel, or Hybrid (no plug-in) – Traditional fueling, proven reliability" },
      { value: "Electric (EV) or Plug-in Hybrid (PHEV)", label: "Electric (EV) or Plug-in Hybrid (PHEV) – Eco-friendly, lower running costs" },
    ],
  },
  {
    id: 6,
    question: "When are you looking to purchase?",
    type: "single",
    options: [
      { value: "Ready now", label: "Ready now – I want to buy within 2 weeks" },
      { value: "Within 1 month", label: "Within 1 month – Actively shopping, ready to decide soon" },
      { value: "Within 3 months", label: "Within 3 months – Planning ahead, comparing options" },
      { value: "Just researching", label: "Just researching – Exploring what's available, no rush" },
    ],
  },
];

// Brand Colors (from style guide)
export const BRAND_COLORS = {
  primary: '#6858E3',
  softBlush: '#F9D1CF',
  coral: '#F27491',
  sunset: '#FEE7D8',
  lavender: '#C9C0F6',
  darkText: '#1D1D1F',
  mutedGray: '#52525A',
  bgLight: '#F8F9FB',
};

// Car Brand Categories
export const CAR_BRANDS = {
  reliable: ['Toyota', 'Honda', 'Mazda', 'Subaru', 'Hyundai', 'Kia', 'Nissan'],
  luxury: ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche', 'Jaguar', 'Land Rover', 'Volvo'],
  supercar: ['McLaren', 'Ferrari', 'Lamborghini', 'Bugatti', 'Koenigsegg', 'Aston Martin'],
};

// Lead Form Fields
export const LEAD_FORM_FIELDS = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your full name',
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'Enter your email address',
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    required: true,
    placeholder: 'Enter your phone number',
  },
  {
    name: 'preferredContact',
    label: 'Preferred Contact Method',
    type: 'select',
    required: false,
    options: [
      { value: 'Email', label: 'Email' },
      { value: 'Phone', label: 'Phone' },
      { value: 'Either', label: 'Either' },
    ],
  },
  {
    name: 'comments',
    label: 'Additional Comments',
    type: 'textarea',
    required: false,
    placeholder: 'Any additional information or special requirements...',
  },
];

// App Configuration
export const APP_CONFIG = {
  appName: 'Car Quiz - Book a Test Drive',
  companyName: 'Book a Test Drive',
  supportEmail: 'sourcing@bookatestdrive.com.au',
  version: '1.0.0',
  
  // API Configuration
  apiTimeout: 30000,
  maxRetries: 3,
  
  // UI Configuration
  animationDuration: 300,
  toastDuration: 5000,
  
  // Form Configuration
  maxNameLength: 50,
  maxCommentLength: 500,
  phonePattern: /^[\+]?[1-9][\d]{0,15}$/,
  
  // Quiz Configuration
  totalQuestions: 6,
  minRequiredAnswers: 6,
  resultsToShow: 2,
};

// Match Score Thresholds
export const MATCH_THRESHOLDS = {
  high: 80,
  medium: 60,
  low: 40,
};

// Stock Level Indicators
export const STOCK_LEVELS = {
  high: 'High Stock Availability',
  medium: 'Medium Stock',
  low: 'Wildtrack stock low',
  outOfStock: 'Out of Stock',
};

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your internet connection.',
  server: 'Server error. Please try again later.',
  validation: 'Please fill in all required fields.',
  quiz: 'Please answer all questions before proceeding.',
  generic: 'Something went wrong. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  quizSubmitted: 'Quiz completed successfully!',
  leadCaptured: 'Thank you! Your information has been submitted successfully.',
  emailSent: 'We\'ll be in touch soon with your car recommendations.',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  quizAnswers: 'carQuiz_answers',
  quizResults: 'carQuiz_results',
  leadInfo: 'carQuiz_leadInfo',
  brokerInfo: 'carQuiz_brokerInfo',
};

// Routes
export const ROUTES = {
  home: '/',
  quiz: '/quiz',
  results: '/results',
  thankYou: '/thank-you',
  about: '/about',
  contact: '/contact',
};

// Broker Configuration
export const BROKER_CONFIG = {
  defaultBroker: 'Direct',
  urlParamName: 'broker',
  trackingEnabled: true,
};

// Social Media Links
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/bookatestdrive',
  instagram: 'https://instagram.com/bookatestdrive',
  twitter: 'https://twitter.com/bookatestdrive',
  linkedin: 'https://linkedin.com/company/bookatestdrive',
};

// Feature Flags
export const FEATURES = {
  darkMode: false,
  analytics: true,
  socialLogin: false,
  multiLanguage: false,
  chatSupport: true,
  emailNotifications: true,
  brokerTracking: true,
  carComparison: true,
  saveProgress: true,
  shareResults: true,
};

export default {
  QUIZ_QUESTIONS,
  BRAND_COLORS,
  CAR_BRANDS,
  LEAD_FORM_FIELDS,
  APP_CONFIG,
  MATCH_THRESHOLDS,
  STOCK_LEVELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  ROUTES,
  BROKER_CONFIG,
  SOCIAL_LINKS,
  FEATURES,
};