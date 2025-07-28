from typing import List, Dict, Optional
import logging
from pyairtable import Api
from openai import OpenAI
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from models import CarMatch, QuizSubmission, LeadCapture
from config import settings
import asyncio

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AirtableService:
    """Service for Airtable API integration"""
    
    def __init__(self):
        # Real API credentials from client
        self.api_key = "pat1Qt72NlpjGSwu5.23012fbb3addbac3dabd07045a965223d2fd5dccd1416bd1c02661263eb34cc0"
        self.base_id = "appGwBVE1xPvs6mZc"
        
        # Initialize Airtable API
        self.api = Api(self.api_key)
        self.models_table = None
        self.cars_table = None
        self.connection_working = False
        
        # Try to connect to the real tables
        try:
            self._connect_to_tables()
            logger.info("🚀 AirtableService initialized successfully with REAL data")
        except Exception as e:
            logger.error(f"❌ Airtable connection failed: {e}")
            logger.info("🔄 Server will start with dummy data for now")
            self.connection_working = False
    
    def _extract_image_url(self, image_field) -> str:
        """Extract URL from Airtable attachment field"""
        if not image_field:
            return ""
        
        # If it's already a string URL, return it
        if isinstance(image_field, str):
            return image_field
        
        # If it's an array of attachments, get the first one's URL
        if isinstance(image_field, list) and len(image_field) > 0:
            first_attachment = image_field[0]
            if isinstance(first_attachment, dict) and 'url' in first_attachment:
                logger.info(f"🖼️ Extracted image URL: {first_attachment['url'][:60]}...")
                return first_attachment['url']
        
        return ""
    
    def _connect_to_tables(self):
        """Connect to the Models and Cars tables"""
        try:
            # Connect to Models table (car model data)
            self.models_table = self.api.table(self.base_id, "Models")
            logger.info("✅ Connected to 'Models' table")
            
            # Connect to Cars table (individual car records)
            self.cars_table = self.api.table(self.base_id, "Cars") 
            logger.info("✅ Connected to 'Cars' table")
            
            # Test connection by fetching more records to find complete ones
            test_records = self.models_table.all(max_records=50)  # Get more records
            if test_records:
                logger.info(f"✅ Connection test successful! Found {len(test_records)} test records")
                
                # Count records with images
                image_count = 0
                for record in test_records:
                    fields = record.get('fields', {})
                    image_field = fields.get('Image Loading')
                    if image_field:
                        image_count += 1
                        brand = fields.get('Brand', 'Unknown')
                        model = fields.get('Model', 'Unknown')
                        logger.info(f"🖼️ Found image for: {brand} {model}")
                
                logger.info(f"🎉 Found {image_count} records with images in first 50 records")
                self.connection_working = True
            else:
                logger.warning("⚠️ No records found in Models table")
                
        except Exception as e:
            logger.error(f"❌ Failed to connect to tables: {e}")
            raise
    
    async def get_all_cars(self) -> List[Dict]:
        """Get all cars from Airtable Models table"""
        if not self.connection_working:
            logger.warning("⚠️ Using dummy data - Airtable connection not working")
            return self._get_dummy_cars()
        
        try:
            logger.info("📋 Fetching all cars from 'Models' table...")
            records = self.models_table.all()
            
            cars = []
            cars_with_images = 0
            
            for i, record in enumerate(records):
                fields = record.get('fields', {})
                
                # Extract image URL properly
                image_field = fields.get('Image Loading') or fields.get('Image')
                image_url = self._extract_image_url(image_field)
                
                if image_url:
                    cars_with_images += 1
                
                # Enhanced field mapping with better fallbacks
                car_data = {
                    "id": record.get('id'),
                    "name": fields.get('Model', 'Unknown Model'),
                    "brand": fields.get('Brand', 'Unknown Brand'),
                    "price_range": fields.get('Price Range', 'Contact for pricing'),
                    "fuel_type": fields.get('Fuel Type', 'Petrol'),  
                    "body_type": fields.get('Body Type', 'Car'),     
                    "seats": str(fields.get('Seats', '5')),          
                    "vehicle_quality": fields.get('Vehicle Quality', 'Everyday'),  
                    "stock_level": fields.get('Stock Level', 'Available'),         
                    "image_url": image_url,  # Already properly extracted
                    "weekly_repayment": fields.get('Weekly Repayment Estimate', 'Contact for quote'),
                    # ✅ NEW FIELDS ADDED:
                    "variants_in_range": fields.get('Variants In Range', 1),  # Default to 1 variant
                    "popular": fields.get('Popular', 'No')  # Default to 'No'
                }
                cars.append(car_data)
                
                # Debug first few records
                if i < 5:
                    logger.info(f"🔍 Record {i+1}: {car_data['brand']} {car_data['name']} - Image: {'✅' if image_url else '❌'}")
            
            logger.info(f"✅ Successfully fetched {len(cars)} cars from Airtable!")
            logger.info(f"🖼️ {cars_with_images} cars have images")
            return cars
            
        except Exception as e:
            logger.error(f"❌ Error fetching cars from Airtable: {e}")
            logger.warning("⚠️ Falling back to dummy data")
            return self._get_dummy_cars()

    
    async def search_cars_by_make_model(self, make: str, model: str) -> List[Dict]:
        """Search cars by make and model"""
        if not self.connection_working:
            logger.warning("⚠️ Using dummy search - Airtable connection not working")
            return [car for car in self._get_dummy_cars() if make.lower() in car['brand'].lower()]
        
        try:
            logger.info(f"🔍 Searching for {make} {model} in 'Models' table...")
            
            # Use Airtable formula to search for brand and model
            formula = f"AND(SEARCH(UPPER('{make}'), UPPER({{Brand}})), SEARCH(UPPER('{model}'), UPPER({{Model}})))"
            records = self.models_table.all(formula=formula)
            
            cars = []
            for record in records:
                fields = record.get('fields', {})
                
                # Extract image URL properly
                image_field = fields.get('Image Loading') or fields.get('Image')
                image_url = self._extract_image_url(image_field)
                
                # ✅ UPDATED: Include all new fields in search results too
                car_data = {
                    "id": record.get('id'),
                    "name": fields.get('Model', 'Unknown Model'),
                    "brand": fields.get('Brand', 'Unknown Brand'),
                    "price_range": fields.get('Price Range', 'Contact for pricing'),
                    "fuel_type": fields.get('Fuel Type', 'Petrol'),
                    "body_type": fields.get('Body Type', 'Car'),
                    "seats": str(fields.get('Seats', '5')),
                    "vehicle_quality": fields.get('Vehicle Quality', 'Everyday'),
                    "stock_level": fields.get('Stock Level', 'Available'),
                    "image_url": image_url,
                    "weekly_repayment": fields.get('Weekly Repayment Estimate', 'Contact for quote'),
                    # ✅ NEW FIELDS ADDED:
                    "variants_in_range": fields.get('Variants In Range', 1),
                    "popular": fields.get('Popular', 'No')
                }
                cars.append(car_data)
            
            logger.info(f"✅ Found {len(cars)} matching cars")
            return cars
            
        except Exception as e:
            logger.error(f"❌ Error searching cars: {e}")
            return []
    
    async def match_cars_to_quiz(self, quiz: QuizSubmission) -> List[Dict]:
        """Match cars based on quiz answers with improved scoring logic"""
        try:
            all_cars = await self.get_all_cars()
            
            if not all_cars:
                return self._get_dummy_cars()[:2]
            
            # Improved scoring algorithm
            scored_cars = []
            for car in all_cars:
                score = 0
                
                # Define brand categories
                reliable_brands = ['Toyota', 'Honda', 'Mazda', 'Subaru', 'Hyundai', 'Kia', 'Nissan']
                luxury_brands = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche', 'Jaguar', 'Land Rover', 'Volvo']
                supercar_brands = ['McLaren', 'Ferrari', 'Lamborghini', 'Bugatti', 'Koenigsegg', 'Aston Martin']
                
                # 1. Vehicle Quality Matching (40% of total score) - ORIGINAL
                if quiz.vehicle_quality.lower() == "everyday":
                    if car['brand'] in reliable_brands:
                        score += 40
                    elif car['brand'] not in luxury_brands and car['brand'] not in supercar_brands:
                        score += 25
                elif quiz.vehicle_quality.lower() == "premium":
                    if car['brand'] in luxury_brands:
                        score += 40
                    elif car['brand'] in reliable_brands:
                        score += 30
                elif quiz.vehicle_quality.lower() == "luxury":
                    if car['brand'] in luxury_brands or car['brand'] in supercar_brands:
                        score += 40
                    else:
                        score += 10
                
                # 2. Fuel Type Matching (30% of total score) - ORIGINAL
                car_name_lower = car['name'].lower()
                car_fuel_lower = car['fuel_type'].lower()
                
                if quiz.fuel_preference.lower() == "hybrid":
                    if "hybrid" in car_name_lower or "prius" in car_name_lower:
                        score += 30
                    elif "hybrid" in car_fuel_lower:
                        score += 30
                    elif "petrol" in car_fuel_lower:
                        score += 15  # Petrol cars can often have hybrid variants
                elif quiz.fuel_preference.lower() == "electric":
                    electric_keywords = ['electric', 'ev', 'model', 'tesla', 'leaf', 'ioniq', 'bolt', 'e-tron']
                    if any(keyword in car_name_lower for keyword in electric_keywords):
                        score += 30
                    elif "electric" in car_fuel_lower:
                        score += 30
                elif quiz.fuel_preference.lower() == "petrol":
                    if "petrol" in car_fuel_lower or "gasoline" in car_fuel_lower:
                        score += 30
                elif quiz.fuel_preference.lower() == "diesel":
                    if "diesel" in car_fuel_lower:
                        score += 30
                
                # 3. Budget Consideration (20% of total score) - ORIGINAL
                budget_keywords = {
                    "under_35k": ["corolla", "yaris", "micra", "swift", "clio", "polo", "fiesta", "rio", "picanto"],
                    "35k_50k": ["camry", "mazda3", "civic", "golf", "i30", "elantra", "cerato"],
                    "50k_70k": ["rav4", "crv", "cx5", "tucson", "sportage", "outlander", "forester"],
                    "70k_100k": ["highlander", "cx9", "pilot", "pathfinder", "palisade", "carnival"],
                    "over_100k": ["lexus", "bmw", "mercedes", "audi", "porsche", "jaguar"]
                }
                
                budget_lower = quiz.budget_range.lower()
                if any(x in budget_lower for x in ["25k", "35k", "entry", "first"]):
                    if any(keyword in car_name_lower for keyword in budget_keywords["under_35k"]):
                        score += 20
                elif any(x in budget_lower for x in ["35k", "50k", "value", "budget"]):
                    if any(keyword in car_name_lower for keyword in budget_keywords["35k_50k"]):
                        score += 20
                elif any(x in budget_lower for x in ["50k", "70k", "family", "spec"]):
                    if any(keyword in car_name_lower for keyword in budget_keywords["50k_70k"]):
                        score += 20
                elif any(x in budget_lower for x in ["70k", "100k", "luxury", "premium"]):
                    if any(keyword in car_name_lower for keyword in budget_keywords["70k_100k"]):
                        score += 20
                elif any(x in budget_lower for x in ["100k", "top", "performance", "prestige"]):
                    if any(keyword in car_name_lower for keyword in budget_keywords["over_100k"]):
                        score += 20
                
                # 4. Seats Matching (10% of total score) - ORIGINAL
                if quiz.seats_needed in car.get('seats', '5'):
                    score += 10
                
                # 5. NEW: Body Type Matching (10 point bonus)
                car_body_type = car.get('body_type', '').lower().strip()
                quiz_body_type = quiz.body_type.lower().strip()
                
                if car_body_type == quiz_body_type:
                    score += 10  # Perfect body type match gets 10 bonus points
                # No penalty for mismatch - just no bonus
                
                # 6. Penalty System (Quality Control) - ORIGINAL
                # Heavy penalty for supercars in non-luxury categories
                if car['brand'] in supercar_brands and quiz.vehicle_quality.lower() != "luxury":
                    score = max(0, score - 60)
                
                # Penalty for luxury cars in everyday category
                if car['brand'] in luxury_brands and quiz.vehicle_quality.lower() == "everyday":
                    score = max(0, score - 20)
                
                # 7. Timeframe consideration (bonus points) - ORIGINAL
                if quiz.timeframe.lower() in ["ready now", "immediately", "asap"]:
                    if car['stock_level'].lower() in ["high", "available", "in stock"]:
                        score += 5
                
                # 8. Add controlled randomness to avoid identical results - ORIGINAL
                score += (hash(car['id'] + quiz.budget_range + quiz.vehicle_quality) % 8)
                
                # Keep score between 0-100
                car['match_score'] = min(max(score, 0), 100)
                scored_cars.append(car)
            
            # Sort by score and return top matches
            sorted_cars = sorted(scored_cars, key=lambda x: x['match_score'], reverse=True)
            
            # Filter out very low scores (below 25) unless we don't have enough good matches
            good_matches = [car for car in sorted_cars if car['match_score'] >= 25]
            if len(good_matches) >= 2:
                matched_cars = good_matches[:2]
            else:
                matched_cars = sorted_cars[:2]  # Take best available even if low score
            
            logger.info(f"✅ Matched {len(matched_cars)} cars with scores: {[c['match_score'] for c in matched_cars]}")
            return matched_cars
            
        except Exception as e:
            logger.error(f"❌ Error matching cars: {e}")
            return self._get_dummy_cars()[:2]
    
    def _get_dummy_cars(self) -> List[Dict]:
        """Fallback dummy data with all fields included"""
        return [
            {
                "id": "dummy1",
                "name": "RAV4 Hybrid",
                "brand": "Toyota",
                "price_range": "$45,000-$55,000",
                "fuel_type": "Hybrid",
                "body_type": "SUV",
                "seats": "5",
                "vehicle_quality": "Premium",
                "stock_level": "High",
                "image_url": "",
                "weekly_repayment": "$280/week",
                "match_score": 95,
                # ✅ NEW FIELDS ADDED:
                "variants_in_range": 3,
                "popular": "Yes"
            },
            {
                "id": "dummy2",
                "name": "CR-V Hybrid",
                "brand": "Honda",
                "price_range": "$48,000-$58,000",
                "fuel_type": "Hybrid",
                "body_type": "SUV",
                "seats": "5",
                "vehicle_quality": "Premium",
                "stock_level": "Medium",
                "image_url": "",
                "weekly_repayment": "$290/week",
                "match_score": 88,
                # ✅ NEW FIELDS ADDED:
                "variants_in_range": 2,
                "popular": "Yes"
            },
            {
                "id": "dummy3",
                "name": "Corolla Hybrid",
                "brand": "Toyota",
                "price_range": "$28,000-$35,000",
                "fuel_type": "Hybrid",
                "body_type": "Sedan",
                "seats": "5",
                "vehicle_quality": "Everyday",
                "stock_level": "High",
                "image_url": "",
                "weekly_repayment": "$190/week",
                "match_score": 82,
                # ✅ NEW FIELDS ADDED:
                "variants_in_range": 4,
                "popular": "No"
            }
        ]

    async def get_all_makes(self) -> List[str]:
        """Get all unique car makes from Airtable"""
        if not self.connection_working:
            logger.warning("⚠️ Using fallback makes - Airtable connection not working")
            return ['Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Hyundai', 'Kia', 'Honda', 'Mazda', 'Subaru']
        
        try:
            logger.info("🔍 Fetching all car makes from Airtable...")
            records = self.models_table.all()
            makes = set()
            
            for record in records:
                brand = record.get('fields', {}).get('Brand', '').strip()
                if brand:
                    makes.add(brand)
            
            makes_list = sorted(list(makes))
            logger.info(f"✅ Found {len(makes_list)} unique makes: {makes_list[:5]}{'...' if len(makes_list) > 5 else ''}")
            return makes_list
            
        except Exception as e:
            logger.error(f"❌ Error fetching makes: {e}")
            return ['Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan']

    async def get_models_by_make(self, make: str) -> List[str]:
        """Get all models for a specific make"""
        if not self.connection_working:
            logger.warning(f"⚠️ Using fallback models for {make} - Airtable connection not working")
            fallback_models = {
                'Toyota': ['Camry', 'Corolla', 'RAV4', 'Prius', 'Highlander'],
                'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'i4'],
                'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'EQA'],
                'Audi': ['A3', 'A4', 'Q3', 'Q5', 'e-tron']
            }
            return fallback_models.get(make, ['Model 1', 'Model 2', 'Model 3'])
        
        try:
            logger.info(f"🔍 Fetching models for make: {make}")
            formula = f"{{Brand}} = '{make}'"
            records = self.models_table.all(formula=formula)
            models = set()
            
            for record in records:
                model = record.get('fields', {}).get('Model', '').strip()
                if model:
                    models.add(model)
            
            models_list = sorted(list(models))
            logger.info(f"✅ Found {len(models_list)} models for {make}: {models_list}")
            return models_list
            
        except Exception as e:
            logger.error(f"❌ Error fetching models for {make}: {e}")
            return []


class OpenAIService:
    """Service for OpenAI API integration"""
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        logger.info("🤖 OpenAIService initialized")
    
    async def generate_explanation(self, cars: List[Dict], quiz_answers: QuizSubmission) -> str:
        """Generate AI explanation for car matches using OpenAI v1.0+ API"""
        try:
            car_details = []
            for car in cars:
                details = f"{car['name']} by {car['brand']} (Match: {car.get('match_score', 90)}%)"
                car_details.append(details)
            
            prompt = f"""
You are a friendly car expert helping customers understand their personalized car recommendations.

Customer Profile:
- Budget: {quiz_answers.budget_range}
- Desired Quality: {quiz_answers.vehicle_quality}
- Fuel Preference: {quiz_answers.fuel_preference}
- Seating Needs: {quiz_answers.seats_needed} seats
- Timeline: {quiz_answers.timeframe}

Top Recommendations: {', '.join(car_details)}

Write a friendly, conversational 2-3 sentence explanation that:
1. Acknowledges their specific needs
2. Explains why these cars are perfect matches
3. Highlights the key benefits for their lifestyle

Be enthusiastic but professional, like a knowledgeable friend giving advice.
"""

            # OpenAI v1.0+ syntax
            client = OpenAI(api_key=self.api_key)
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful car expert who explains car recommendations in a friendly, conversational way."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            explanation = response.choices[0].message.content.strip()
            logger.info("✅ Generated AI explanation successfully")
            return explanation
            
        except Exception as e:
            logger.error(f"❌ Error generating AI explanation: {e}")
            # Enhanced fallback explanation
            car_names = [car['name'] for car in cars]
            return f"Based on your preferences for {quiz_answers.vehicle_quality} quality and {quiz_answers.fuel_preference} fuel type, we've selected {', '.join(car_names)} as excellent matches for your budget of {quiz_answers.budget_range}. These vehicles offer great value, reliability, and will meet your specific needs perfectly!"


class EmailService:
    """Service for email sending"""
    
    def __init__(self):
        self.lead_email = settings.lead_email
        logger.info(f"📧 EmailService initialized - sending to: {self.lead_email}")
    
    async def send_lead_email(self, lead_data: LeadCapture) -> bool:
        """Send lead capture email via Gmail SMTP"""
        try:
            # Format subject line
            car_info = f"{lead_data.selected_cars[0].name}" if lead_data.selected_cars else "Car Quiz Lead"
            subject = f"🚗 New Lead from {lead_data.broker_name or 'Direct'} – Interested in {car_info}"
            
            # Format car matches
            car_details = []
            for car in lead_data.selected_cars:
                car_detail = f"""
[Car Name]: {car.name}
Price: {car.price_range}
Fuel Type: {car.fuel_type}
Seats: {car.seats}
Body: {car.body_type}
Quality: {car.vehicle_quality or 'Not specified'}
Stock Status: {car.stock_level}
Match Score: {car.match_percentage}%
Image: {car.image_url or 'No image'}
"""
                car_details.append(car_detail)
            
            # Create email body in client's format
            email_body = f"""
Hi BATD Sourcing Team,

You've received a new lead from {lead_data.broker_name or 'Direct'}. The client has completed their car quiz and is ready for vehicle sourcing support.

👤 Client Details
Full Name: {lead_data.customer_name}
Email: {lead_data.customer_email}
Phone: {lead_data.customer_phone}
Preferred Contact Method: {lead_data.preferred_contact_method}
Submitted By Broker: {lead_data.broker_name or 'Direct'} ({lead_data.broker_email or 'N/A'})

🎯 Client Quiz Responses
Budget Range: {lead_data.quiz_answers.budget_range}
Seats Required: {lead_data.quiz_answers.seats_needed}
Fuel Type Preference: {lead_data.quiz_answers.fuel_preference}
Vehicle Quality Preference: {lead_data.quiz_answers.vehicle_quality}
Purchase Timeframe: {lead_data.quiz_answers.timeframe}

🚘 Top Car Matches
{''.join(car_details)}

Additional Comments: {lead_data.additional_comments or 'None'}

---
Generated by Car Quiz System
Time: {lead_data.created_at if hasattr(lead_data, 'created_at') else 'Now'}
"""
            
            # Send actual email via SMTP
            await self._send_smtp_email(subject, email_body, self.lead_email)
            
            logger.info(f"✅ Email sent successfully to {self.lead_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error sending lead email: {e}")
            return False
    
    async def _send_smtp_email(self, subject: str, body: str, to_email: str):
        """Send email via Gmail SMTP"""
        def send_email():
            try:
                # Create message
                msg = MIMEMultipart()
                msg['From'] = settings.smtp_username
                msg['To'] = to_email
                msg['Subject'] = subject
                
                # Add body
                msg.attach(MIMEText(body, 'plain'))
                
                # Send via Gmail SMTP
                server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
                server.starttls()
                server.login(settings.smtp_username, settings.smtp_password)
                text = msg.as_string()
                server.sendmail(settings.smtp_username, to_email, text)
                server.quit()
                
                logger.info("📧 Email sent via SMTP successfully")
                
            except Exception as e:
                logger.error(f"❌ SMTP Error: {e}")
                raise e
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, send_email)