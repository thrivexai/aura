from fastapi import FastAPI, APIRouter, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class LeadCaptureWebhook(BaseModel):
    name: str
    email: str
    whatsapp: Optional[str] = None
    userAgent: Optional[str] = None
    fbclid: Optional[str] = None
    _fbc: Optional[str] = None
    _fbp: Optional[str] = None
    utmSource: Optional[str] = None
    utmMedium: Optional[str] = None
    utmCampaign: Optional[str] = None
    utmContent: Optional[str] = None
    utmTerm: Optional[str] = None
    referrer: Optional[str] = None
    quizAnswers: Optional[Dict[str, Any]] = None
    bucketId: Optional[str] = None
    eventType: str = "InitiateCheckout"
    value: float = 15.0
    currency: str = "USD"

class PurchaseWebhook(BaseModel):
    name: str
    email: str
    whatsapp: Optional[str] = None
    transactionId: str
    orderId: Optional[str] = None
    userAgent: Optional[str] = None
    fbclid: Optional[str] = None
    _fbc: Optional[str] = None
    _fbp: Optional[str] = None
    utmSource: Optional[str] = None
    utmMedium: Optional[str] = None
    utmCampaign: Optional[str] = None
    eventType: str = "Purchase"
    value: float = 15.0
    currency: str = "USD"
    paymentMethod: str = "hotmart"

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.get("/leads")
async def get_leads():
    try:
        # Obtener datos de lead_webhooks collection
        leads_cursor = db.lead_webhooks.find().sort("timestamp", -1).limit(100)
        leads = []
        
        for lead in leads_cursor:
            # Convertir ObjectId a string si existe
            if "_id" in lead:
                lead["_id"] = str(lead["_id"])
            
            # Mapear los datos del webhook al formato esperado por el frontend
            formatted_lead = {
                "id": lead.get("session_id", str(lead.get("_id", ""))),
                "name": lead.get("name", "Sin nombre"),
                "email": lead.get("email", "sin-email@ejemplo.com"),
                "whatsapp": lead.get("whatsapp"),
                "businessType": lead.get("quiz_answers", {}).get("business_type", "sin-especificar"),
                "mainCost": lead.get("quiz_answers", {}).get("main_cost", "sin-especificar"),
                "objective": lead.get("quiz_answers", {}).get("objective", "sin-especificar"),
                "aiUsage": lead.get("quiz_answers", {}).get("ai_usage", "sin-especificar"),
                "stage": "lead_capture",  # Default desde lead-capture webhook
                "createdAt": lead.get("timestamp", datetime.utcnow().isoformat()),
                "ip": lead.get("ip_address"),
                "userAgent": lead.get("user_agent"),
                "utmSource": lead.get("utm_params", {}).get("utm_source"),
                "utmMedium": lead.get("utm_params", {}).get("utm_medium"),
                "utmCampaign": lead.get("utm_params", {}).get("utm_campaign")
            }
            leads.append(formatted_lead)
        
        return {"leads": leads, "total": len(leads)}
    except Exception as e:
        print(f"Error getting leads: {e}")
        return {"leads": [], "total": 0, "error": str(e)}

@api_router.get("/purchases")
async def get_purchases():
    try:
        # Obtener datos de purchase_webhooks collection
        purchases_cursor = db.purchase_webhooks.find().sort("timestamp", -1).limit(100)
        purchases = []
        
        for purchase in purchases_cursor:
            # Convertir ObjectId a string si existe
            if "_id" in purchase:
                purchase["_id"] = str(purchase["_id"])
            
            formatted_purchase = {
                "id": purchase.get("session_id", str(purchase.get("_id", ""))),
                "name": purchase.get("name", "Sin nombre"),
                "email": purchase.get("email", "sin-email@ejemplo.com"),
                "whatsapp": purchase.get("whatsapp"),
                "businessType": purchase.get("quiz_answers", {}).get("business_type", "sin-especificar"),
                "mainCost": purchase.get("quiz_answers", {}).get("main_cost", "sin-especificar"),
                "objective": purchase.get("quiz_answers", {}).get("objective", "sin-especificar"),
                "aiUsage": purchase.get("quiz_answers", {}).get("ai_usage", "sin-especificar"),
                "stage": "purchased",
                "createdAt": purchase.get("timestamp", datetime.utcnow().isoformat()),
                "transactionId": purchase.get("transaction_id"),
                "amount": 15.0,  # Workshop price
                "ip": purchase.get("ip_address"),
                "userAgent": purchase.get("user_agent")
            }
            purchases.append(formatted_purchase)
        
        return {"purchases": purchases, "total": len(purchases)}
    except Exception as e:
        print(f"Error getting purchases: {e}")
        return {"purchases": [], "total": 0, "error": str(e)}

@api_router.get("/metrics")
async def get_metrics():
    try:
        # Calcular métricas reales de la base de datos
        total_leads = db.lead_webhooks.count_documents({})
        total_purchases = db.purchase_webhooks.count_documents({})
        
        # Calcular métricas básicas (puedes expandir esto con más lógica)
        estimated_visitors = max(total_leads * 3, 100)  # Estimación basada en leads
        conversion_rate = (total_purchases / max(total_leads, 1)) * 100 if total_leads > 0 else 0
        
        metrics = {
            "totalVisitors": estimated_visitors,
            "leadsGenerated": total_leads,
            "purchases": total_purchases,
            "conversionRate": round(conversion_rate, 1),
            "quizStarts": int(total_leads * 1.5),  # Estimación
            "quizCompletions": total_leads,
            "diagnosisViewed": int(total_leads * 0.8),  # Estimación
            "checkoutClicks": int(total_leads * 0.4),  # Estimación
        }
        
        return metrics
    except Exception as e:
        print(f"Error getting metrics: {e}")
        return {
            "totalVisitors": 0,
            "leadsGenerated": 0,
            "purchases": 0,
            "conversionRate": 0,
            "quizStarts": 0,
            "quizCompletions": 0,
            "diagnosisViewed": 0,
            "checkoutClicks": 0,
            "error": str(e)
        }

# Endpoint para obtener IP del cliente
@api_router.get("/get-client-ip")
async def get_client_ip(request: Request):
    # Obtener IP real del cliente considerando proxies
    client_ip = request.client.host
    
    # Verificar headers de proxy
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        client_ip = real_ip
    
    return {"ip": client_ip}

# Webhook para Lead Capture (InitiateCheckout)
@api_router.post("/webhooks/lead-capture")
async def lead_capture_webhook(webhook_data: LeadCaptureWebhook, request: Request):
    try:
        # Obtener IP del cliente
        client_ip = request.client.host
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        
        # Agregar IP a los datos
        webhook_dict = webhook_data.dict()
        webhook_dict["clientIP"] = client_ip
        webhook_dict["timestamp"] = datetime.utcnow()
        webhook_dict["id"] = str(uuid.uuid4())
        
        # Guardar en base de datos
        await db.lead_webhooks.insert_one(webhook_dict)
        
        # Aquí puedes agregar lógica para enviar a servicios externos
        # Por ejemplo, Facebook Conversions API, Make.com, Zapier, etc.
        
        logger.info(f"Lead capture webhook received: {webhook_data.email}")
        
        return {
            "success": True,
            "message": "Lead capture webhook processed successfully",
            "data": {
                "email": webhook_data.email,
                "eventType": webhook_data.eventType,
                "clientIP": client_ip
            }
        }
        
    except Exception as e:
        logger.error(f"Error processing lead capture webhook: {str(e)}")
        return {"success": False, "error": str(e)}

# Webhook para Purchase
@api_router.post("/webhooks/purchase") 
async def purchase_webhook(webhook_data: PurchaseWebhook, request: Request):
    try:
        # Obtener IP del cliente
        client_ip = request.client.host
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        
        # Agregar IP a los datos
        webhook_dict = webhook_data.dict()
        webhook_dict["clientIP"] = client_ip
        webhook_dict["timestamp"] = datetime.utcnow()
        webhook_dict["id"] = str(uuid.uuid4())
        
        # Guardar en base de datos
        await db.purchase_webhooks.insert_one(webhook_dict)
        
        # Aquí puedes agregar lógica para enviar a servicios externos
        # Facebook Conversions API, email automation, etc.
        
        logger.info(f"Purchase webhook received: {webhook_data.email} - Transaction: {webhook_data.transactionId}")
        
        return {
            "success": True,
            "message": "Purchase webhook processed successfully", 
            "data": {
                "email": webhook_data.email,
                "transactionId": webhook_data.transactionId,
                "eventType": webhook_data.eventType,
                "clientIP": client_ip
            }
        }
        
    except Exception as e:
        logger.error(f"Error processing purchase webhook: {str(e)}")
        return {"success": False, "error": str(e)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
