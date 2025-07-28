from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Union

class QuizSubmission(BaseModel):
    """Quiz submission data model - matches the 5 questions from client requirements"""
    body_type: Optional[str] = Field("SUV", description="Car body type preference")
    budget_range: str = Field(..., description="Budget range (e.g., '$35k-$50k')")
    vehicle_quality: str = Field(..., description="Quality level: Everyday, Premium, or Luxury")
    fuel_preference: str = Field(..., description="Fuel type preference")
    seats_needed: str = Field(..., description="Number of seats needed")
    timeframe: str = Field(..., description="Purchase timeframe")
    
    class Config:
        schema_extra = {
            "example": {
                "budget_range": "$35k-$50k",
                "vehicle_quality": "Premium",
                "fuel_preference": "Hybrid",
                "seats_needed": "5",
                "timeframe": "Within 1 month"
            }
        }

class CarMatch(BaseModel):
    """Car match result model with all required fields"""
    name: str = Field(..., description="Car model name")
    brand: str = Field(..., description="Car brand/manufacturer")
    price_range: str = Field(..., description="Price range")
    match_percentage: int = Field(..., ge=0, le=100, description="Match percentage (0-100)")
    stock_level: str = Field(..., description="Stock availability")
    fuel_type: str = Field(..., description="Fuel type")
    body_type: str = Field(..., description="Body type (SUV, Sedan, etc.)")
    seats: str = Field(..., description="Number of seats")
    image_url: Optional[str] = Field(None, description="Car image URL")
    vehicle_quality: Optional[str] = Field(None, description="Quality level")
    weekly_repayment: Optional[str] = Field(None, description="Weekly repayment estimate")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Toyota RAV4 Hybrid",
                "brand": "Toyota",
                "price_range": "$45,000-$55,000",
                "match_percentage": 95,
                "stock_level": "High",
                "fuel_type": "Hybrid",
                "body_type": "SUV",
                "seats": "5",
                "image_url": "https://example.com/rav4.jpg",
                "vehicle_quality": "Premium",
                "weekly_repayment": "$280"
            }
        }

class LeadCapture(BaseModel):
    """Lead capture form model - matches client's email format requirements"""
    # Customer Information
    customer_name: str = Field(..., description="Customer's full name")
    customer_email: EmailStr = Field(..., description="Customer's email address")
    customer_phone: str = Field(..., description="Customer's phone number")
    
    # Broker Information (optional for direct leads)
    broker_name: Optional[str] = Field(None, description="Broker's name")
    broker_email: Optional[EmailStr] = Field(None, description="Broker's email")
    
    # Quiz and Car Selection Data
    selected_cars: List[CarMatch] = Field(..., description="Cars selected/matched")
    quiz_answers: QuizSubmission = Field(..., description="Original quiz responses")
    
    # Additional Fields
    preferred_contact_method: Optional[str] = Field("Email", description="Preferred contact method")
    additional_comments: Optional[str] = Field(None, description="Additional customer comments")
    
    class Config:
        schema_extra = {
            "example": {
                "customer_name": "John Smith",
                "customer_email": "john.smith@email.com",
                "customer_phone": "+61400123456",
                "broker_name": "Sarah Johnson",
                "broker_email": "sarah@brokercompany.com",
                "selected_cars": [
                    {
                        "name": "Toyota RAV4 Hybrid",
                        "brand": "Toyota",
                        "price_range": "$45,000-$55,000",
                        "match_percentage": 95,
                        "stock_level": "High",
                        "fuel_type": "Hybrid",
                        "body_type": "SUV",
                        "seats": "5"
                    }
                ],
                "quiz_answers": {
                    "budget_range": "$35k-$50k",
                    "vehicle_quality": "Premium",
                    "fuel_preference": "Hybrid",
                    "seats_needed": "5",
                    "timeframe": "Within 1 month"
                },
                "preferred_contact_method": "Email",
                "additional_comments": "Looking for family-friendly SUV"
            }
        }

class CarSearchRequest(BaseModel):
    """Car search request model for known make/model searches"""
    make: str = Field(..., description="Car manufacturer/brand")
    model: str = Field(..., description="Car model")
    looking_for: str = Field(..., description="New or Used")
    additional_comments: Optional[str] = Field(None, description="Additional search comments")
    
    # Optional customer info for lead tracking
    customer_name: Optional[str] = Field(None, description="Customer name")
    customer_email: Optional[EmailStr] = Field(None, description="Customer email")
    broker_name: Optional[str] = Field(None, description="Broker name")
    
    class Config:
        schema_extra = {
            "example": {
                "make": "Toyota",
                "model": "RAV4",
                "looking_for": "New",
                "additional_comments": "Looking for hybrid version",
                "customer_name": "John Smith",
                "customer_email": "john@email.com"
            }
        }
class QuizResponse(BaseModel):
    """Complete quiz response with matches and explanation"""
    matches: List[CarMatch] = Field(..., description="Top car matches")
    explanation: str = Field(..., description="AI-generated explanation")
    total_matches: int = Field(..., description="Total number of matches found")
    quiz_data: QuizSubmission = Field(..., description="Original quiz submission")
    
class APIResponse(BaseModel):
    """Generic API response model"""
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Response message")
    data: Optional[Union[dict, List[dict], QuizResponse]] = Field(None, description="Response data")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Operation completed successfully",
                "data": {"key": "value"}
            }
        }

# Additional Models for Enhanced Functionality

class BrokerInfo(BaseModel):
    """Broker information model"""
    broker_id: Optional[str] = Field(None, description="Unique broker identifier")
    broker_name: str = Field(..., description="Broker's full name")
    broker_email: EmailStr = Field(..., description="Broker's email")
    company_name: Optional[str] = Field(None, description="Broker's company")
    tracking_url_param: Optional[str] = Field(None, description="URL parameter for tracking")

class QuizStatistics(BaseModel):
    """Quiz statistics model for analytics"""
    total_submissions: int = Field(..., description="Total quiz submissions")
    popular_budget_ranges: List[str] = Field(..., description="Most popular budget ranges")
    popular_fuel_types: List[str] = Field(..., description="Most popular fuel preferences")
    conversion_rate: float = Field(..., description="Quiz to lead conversion rate")

class CarFilters(BaseModel):
    """Advanced car filtering options"""
    budget_min: Optional[int] = Field(None, description="Minimum budget")
    budget_max: Optional[int] = Field(None, description="Maximum budget")
    fuel_types: Optional[List[str]] = Field(None, description="Preferred fuel types")
    body_types: Optional[List[str]] = Field(None, description="Preferred body types")
    brands: Optional[List[str]] = Field(None, description="Preferred brands")
    seats_min: Optional[int] = Field(None, description="Minimum seats required")
    stock_levels: Optional[List[str]] = Field(None, description="Required stock levels")