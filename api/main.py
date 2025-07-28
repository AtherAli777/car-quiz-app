from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import logging

from config import settings
from models import (
    QuizSubmission, 
    CarMatch, 
    LeadCapture, 
    CarSearchRequest, 
    APIResponse
)
from services import AirtableService, OpenAIService, EmailService

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="API for car quiz lead generation system",
    version=settings.version,
    debug=settings.debug
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
airtable_service = AirtableService()
openai_service = OpenAIService()
email_service = EmailService()

# Root endpoint
@app.get("/", response_model=APIResponse)
async def root():
    """Root endpoint - API health check"""
    return APIResponse(
        success=True,
        message=f"🚗 {settings.app_name} is running!",
        data={"version": settings.version}
    )

# Health check endpoint
@app.get("/health", response_model=APIResponse)
async def health_check():
    """Health check endpoint"""
    return APIResponse(
        success=True,
        message="API is healthy",
        data={"status": "healthy", "services": ["airtable", "openai", "email"]}
    )

# Update the quiz submission endpoint
@app.post("/api/quiz/submit", response_model=APIResponse)
async def submit_quiz(quiz: QuizSubmission):
    """Submit quiz and get car matches with real matching logic"""
    try:
        logger.info(f"Processing quiz: {quiz.budget_range}, {quiz.vehicle_quality}, {quiz.fuel_preference}")
        
        # Get matched cars from Airtable with scoring
        matched_cars = await airtable_service.match_cars_to_quiz(quiz)
        
        if not matched_cars:
            raise HTTPException(status_code=404, detail="No matching cars found")
        
        # Convert to CarMatch objects
        car_matches = []
        for car in matched_cars:
            car_match = CarMatch(
                name=car["name"],
                brand=car["brand"],
                price_range=car["price_range"],
                match_percentage=car.get("match_score", 90),
                stock_level=car["stock_level"],
                fuel_type=car["fuel_type"],
                body_type=car["body_type"],
                seats=car["seats"],
                image_url=car.get("image_url", "")
            )
            car_matches.append(car_match)
        
        # Generate AI explanation
        explanation = await openai_service.generate_explanation(matched_cars, quiz)
        
        logger.info(f"Successfully matched {len(car_matches)} cars with AI explanation")
        
        return APIResponse(
            success=True,
            message="Quiz processed successfully with real data",
            data={
                "matches": [match.dict() for match in car_matches],
                "explanation": explanation,
                "total_matches": len(car_matches),
                "data_source": "airtable"
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Car search endpoints
@app.post("/api/cars/search", response_model=APIResponse)
async def search_cars(search_request: CarSearchRequest):
    """Search for specific car make/model"""
    try:
        logger.info(f"Searching for: {search_request.make} {search_request.model}")
        
        cars_data = await airtable_service.search_cars_by_make_model(
            search_request.make, 
            search_request.model
        )
        
        # Format cars as CarMatch objects
        formatted_cars = []
        for car in cars_data:
            formatted_car = {
                "name": f"{car.get('brand', '')} {car.get('name', '')}".strip(),
                "brand": car.get('brand', ''),
                "price_range": car.get('price_range', 'Contact for pricing'),
                "match_percentage": 95,  # High match since it's exact search
                "stock_level": car.get('stock_level', 'Available'),
                "fuel_type": car.get('fuel_type', 'Petrol'),
                "body_type": car.get('body_type', 'Car'),
                "seats": car.get('seats', '5'),
                "image_url": car.get('image_url', ''),
                "vehicle_quality": car.get('vehicle_quality', 'Premium'),
                "weekly_repayment": car.get('weekly_repayment', 'Contact for quote')
            }
            formatted_cars.append(formatted_car)
        
        return APIResponse(
            success=True,
            message=f"Found {len(formatted_cars)} results",
            data={
                "cars": formatted_cars,
                "search_terms": f"{search_request.make} {search_request.model}",
                "looking_for": search_request.looking_for,
                "total_results": len(formatted_cars)
            }
        )
        
    except Exception as e:
        logger.error(f"Error searching cars: {e}")
        raise HTTPException(status_code=500, detail=str(e))
# Lead capture endpoints
@app.post("/api/leads/capture", response_model=APIResponse)
async def capture_lead(lead: LeadCapture):
    """Capture lead and send email"""
    try:
        logger.info(f"Capturing lead: {lead.customer_name}")
        
        # Send email
        email_sent = await email_service.send_lead_email(lead)
        
        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send email")
        
        return APIResponse(
            success=True,
            message="Lead captured successfully",
            data={
                "customer": lead.customer_name,
                "email_sent": email_sent,
                "cars_selected": len(lead.selected_cars)
            }
        )
        
    except Exception as e:
        logger.error(f"Error capturing lead: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Test endpoints for debugging
@app.get("/api/test/cars", response_model=APIResponse)
async def test_get_cars():
    """Test endpoint to get all cars"""
    try:
        cars = await airtable_service.get_all_cars()
        return APIResponse(
            success=True,
            message=f"Retrieved {len(cars)} cars",
            data={"cars": cars}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/cars/makes", response_model=APIResponse)
async def get_car_makes():
    """Get all available car makes"""
    try:
        makes = await airtable_service.get_all_makes()
        return APIResponse(
            success=True,
            message=f"Found {len(makes)} car makes",
            data={"makes": makes}
        )
    except Exception as e:
        logger.error(f"Error getting makes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cars/models", response_model=APIResponse)
async def get_car_models(make: str):
    """Get models for a specific make"""
    try:
        models = await airtable_service.get_models_by_make(make)
        return APIResponse(
            success=True,
            message=f"Found {len(models)} models for {make}",
            data={"models": models, "make": make}
        )
    except Exception as e:
        logger.error(f"Error getting models for {make}: {e}")
        raise HTTPException(status_code=500, detail=str(e))