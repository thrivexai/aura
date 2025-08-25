from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from supabase import create_client, Client
import asyncpg
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase connection
supabase_url = os.environ['SUPABASE_URL']
supabase_key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
supabase: Client = create_client(supabase_url, supabase_key)

# PostgreSQL connection for direct queries (optional, for better performance)
DATABASE_URL = os.environ.get('SUPABASE_DB_URL')

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

# Helper function to get database connection
async def get_db_connection():
    if DATABASE_URL:
        return await asyncpg.connect(DATABASE_URL)
    return None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    try:
        status_obj = StatusCheck(**input.dict())
        result = supabase.table('status_checks').insert({
            'id': status_obj.id,
            'client_name': status_obj.client_name,
            'timestamp': status_obj.timestamp.isoformat()
        }).execute()
        
        if result.data:
            return status_obj
        else:
            raise Exception("Failed to insert status check")
    except Exception as e:
        print(f"Error creating status check: {e}")
        raise

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    try:
        result = supabase.table('status_checks').select('*').order('created_at', desc=True).limit(1000).execute()
        
        status_checks = []
        for status_check in result.data:
            status_checks.append(StatusCheck(
                id=status_check['id'],
                client_name=status_check['client_name'],
                timestamp=datetime.fromisoformat(status_check['timestamp'].replace('Z', '+00:00'))
            ))
        
        return status_checks
    except Exception as e:
        print(f"Error getting status checks: {e}")
        return []

@api_router.get("/leads")
async def get_leads():
    try:
        # Get data from lead_webhooks table
        result = supabase.table('lead_webhooks').select('*').order('created_at', desc=True).limit(100).execute()
        
        leads = []
        for lead in result.data:
            # Map webhook data to expected frontend format
            quiz_answers = lead.get('quiz_answers', {}) or {}
            
            formatted_lead = {
                "id": lead.get("session_id", lead.get("id", "")),
                "name": lead.get("name", "Sin nombre"),
                "email": lead.get("email", "sin-email@ejemplo.com"),
                "whatsapp": lead.get("whatsapp"),
                "businessType": quiz_answers.get("1", "sin-especificar") if isinstance(quiz_answers, dict) else "sin-especificar",
                "mainCost": quiz_answers.get("3", "sin-especificar") if isinstance(quiz_answers, dict) else "sin-especificar",
                "objective": quiz_answers.get("4", "sin-especificar") if isinstance(quiz_answers, dict) else "sin-especificar",
                "aiUsage": quiz_answers.get("5", "sin-especificar") if isinstance(quiz_answers, dict) else "sin-especificar",
                "stage": "lead_capture",  # Default from lead-capture webhook
                "createdAt": lead.get("created_at", datetime.utcnow().isoformat()),
                # Complete tracking data
                "ip": lead.get("client_ip"),
                "userAgent": lead.get("user_agent"),
                "utmSource": lead.get("utm_source"),
                "utmMedium": lead.get("utm_medium"),
                "utmCampaign": lead.get("utm_campaign"),
                "utmContent": lead.get("utm_content"),
                "utmTerm": lead.get("utm_term"),
                # Facebook tracking
                "fbclid": lead.get("fbclid"),
                "_fbc": lead.get("_fbc"),
                "_fbp": lead.get("_fbp"),
                # Additional data
                "referrer": lead.get("referrer"),
                "currentUrl": lead.get("current_url"),
                "sessionId": lead.get("session_id")
            }
            leads.append(formatted_lead)
        
        return {"leads": leads, "total": len(leads)}
    except Exception as e:
        print(f"Error getting leads: {e}")
        return {"leads": [], "total": 0, "error": str(e)}

@api_router.get("/purchases")
async def get_purchases():
    try:
        # Get data from purchase_webhooks table
        result = supabase.table('purchase_webhooks').select('*').order('created_at', desc=True).limit(100).execute()
        
        purchases = []
        for purchase in result.data:
            quiz_answers = purchase.get('quiz_answers', {}) or {}
            
            formatted_purchase = {
                "id": purchase.get("session_id", purchase.get("id", "")),
                "name": purchase.get("name", "Sin nombre"),
                "email": purchase.get("email", "sin-email@ejemplo.com"),
                "whatsapp": purchase.get("whatsapp"),
                "businessType": quiz_answers.get("1", "sin-especificar") if isinstance(quiz_answers, dict) else "sin-especificar",
                "mainCost": quiz_answers.get("3", "sin-especificar") if isinstance(quiz_answers, dict) else "sin-especificar",
                "objective": quiz_answers.get("4", "sin-especificar") if isinstance(quiz_answers, dict) else "sin-especificar",
                "aiUsage": quiz_answers.get("5", "sin-especificar") if isinstance(quiz_answers, dict) else "sin-especificar",
                "stage": "purchased",
                "createdAt": purchase.get("created_at", datetime.utcnow().isoformat()),
                "transactionId": purchase.get("transaction_id"),
                "amount": float(purchase.get("value", 15.0)),
                # Complete tracking data
                "ip": purchase.get("client_ip"),
                "userAgent": purchase.get("user_agent"),
                "utmSource": purchase.get("utm_source"),
                "utmMedium": purchase.get("utm_medium"),
                "utmCampaign": purchase.get("utm_campaign"),
                "utmContent": purchase.get("utm_content"),
                "utmTerm": purchase.get("utm_term"),
                # Facebook tracking
                "fbclid": purchase.get("fbclid"),
                "_fbc": purchase.get("_fbc"),
                "_fbp": purchase.get("_fbp"),
                # Additional data
                "referrer": purchase.get("referrer"),
                "currentUrl": purchase.get("current_url"),
                "sessionId": purchase.get("session_id")
            }
            purchases.append(formatted_purchase)
        
        return {"purchases": purchases, "total": len(purchases)}
    except Exception as e:
        print(f"Error getting purchases: {e}")
        return {"purchases": [], "total": 0, "error": str(e)}

@api_router.get("/metrics")
async def get_metrics():
    try:
        # Calculate real metrics from database
        leads_result = supabase.table('lead_webhooks').select('id', count='exact').execute()
        purchases_result = supabase.table('purchase_webhooks').select('id', count='exact').execute()
        
        total_leads = leads_result.count or 0
        total_purchases = purchases_result.count or 0
        
        # Calculate basic metrics (you can expand this with more logic)
        estimated_visitors = max(total_leads * 3, 100)  # Estimation based on leads
        conversion_rate = (total_purchases / max(total_leads, 1)) * 100 if total_leads > 0 else 0
        
        metrics = {
            "totalVisitors": estimated_visitors,
            "leadsGenerated": total_leads,
            "purchases": total_purchases,
            "conversionRate": round(conversion_rate, 1),
            "quizStarts": int(total_leads * 1.5),  # Estimation
            "quizCompletions": total_leads,
            "diagnosisViewed": int(total_leads * 0.8),  # Estimation
            "checkoutClicks": int(total_leads * 0.4),  # Estimation
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

@api_router.get("/export-leads-csv")
async def export_leads_csv():
    """Export all leads data to CSV format"""
    try:
        import csv
        from io import StringIO
        
        # Get all lead data from Supabase
        result = supabase.table('lead_webhooks').select('*').order('created_at', desc=True).execute()
        
        # Create CSV content
        output = StringIO()
        writer = csv.writer(output)
        
        # Write headers
        headers = [
            'Nombre', 'Email', 'WhatsApp', 'Tipo Negocio', 'Costo Principal', 'Objetivo', 'Uso IA', 'Etapa', 'Fecha Creacion',
            'IP', 'User Agent', 'Session ID', 'Referrer', 'URL Actual',
            'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
            'fbclid', '_fbc', '_fbp',
            'Transaction ID', 'Valor', 'Moneda', 'Timestamp Completo'
        ]
        writer.writerow(headers)
        
        # Write data rows
        for lead in result.data:
            quiz_answers = lead.get("quiz_answers", {}) or {}
            
            row = [
                lead.get("name", ""),
                lead.get("email", ""),
                lead.get("whatsapp", "N/A"),
                quiz_answers.get("1", "N/A") if isinstance(quiz_answers, dict) else "N/A",
                quiz_answers.get("3", "N/A") if isinstance(quiz_answers, dict) else "N/A",
                quiz_answers.get("4", "N/A") if isinstance(quiz_answers, dict) else "N/A",
                quiz_answers.get("5", "N/A") if isinstance(quiz_answers, dict) else "N/A",
                "Captura de Lead",
                lead.get("created_at", "N/A"),
                lead.get("client_ip", "N/A"),
                lead.get("user_agent", "N/A"),
                lead.get("session_id", "N/A"),
                lead.get("referrer", "N/A"),
                lead.get("current_url", "N/A"),
                lead.get("utm_source", "N/A"),
                lead.get("utm_medium", "N/A"),
                lead.get("utm_campaign", "N/A"),
                lead.get("utm_content", "N/A"),
                lead.get("utm_term", "N/A"),
                lead.get("fbclid", "N/A"),
                lead.get("_fbc", "N/A"),
                lead.get("_fbp", "N/A"),
                "N/A",  # Transaction ID
                lead.get("value", "N/A"),
                lead.get("currency", "N/A"),
                lead.get("timestamp", "N/A")
            ]
            writer.writerow(row)
        
        csv_content = output.getvalue()
        output.close()
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=leads_completo.csv"}
        )
        
    except Exception as e:
        print(f"Error exporting leads CSV: {e}")
        return {"error": str(e)}

@api_router.post("/proxy-webhook")
async def proxy_webhook(request: Request):
    """Proxy webhook requests to external URLs to avoid CORS issues"""
    try:
        import httpx
        
        # Get request data
        webhook_data = await request.json()
        target_url = webhook_data.pop('_target_url', None)
        
        if not target_url:
            return {"success": False, "error": "Missing _target_url parameter"}
        
        # Validate target URL
        if not (target_url.startswith('http://') or target_url.startswith('https://')):
            return {"success": False, "error": "Invalid target URL"}
        
        # Send webhook to external URL
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                target_url,
                json=webhook_data,
                headers={'Content-Type': 'application/json'}
            )
            
            return {
                "success": True,
                "message": "Webhook proxied successfully",
                "target_url": target_url,
                "status_code": response.status_code,
                "response_text": response.text[:200] if response.text else None
            }
            
    except Exception as e:
        print(f"Error proxying webhook: {e}")
        return {"success": False, "error": f"Proxy error: {str(e)}"}

@api_router.get("/export-purchases-csv")
async def export_purchases_csv():
    """Export all purchases data to CSV format"""
    try:
        import csv
        from io import StringIO
        
        # Get all purchase data from Supabase
        result = supabase.table('purchase_webhooks').select('*').order('created_at', desc=True).execute()
        
        # Create CSV content
        output = StringIO()
        writer = csv.writer(output)
        
        # Write headers
        headers = [
            'Nombre', 'Email', 'WhatsApp', 'Transaction ID', 'Fecha', 'Valor', 'Moneda',
            'Tipo Negocio', 'Costo Principal', 'Objetivo', 'Uso IA',
            'IP', 'User Agent', 'Session ID',
            'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
            'fbclid', '_fbc', '_fbp',
            'Referrer', 'URL Actual', 'Timestamp Completo'
        ]
        writer.writerow(headers)
        
        # Write data rows
        for purchase in result.data:
            quiz_answers = purchase.get("quiz_answers", {}) or {}
            
            row = [
                purchase.get("name", ""),
                purchase.get("email", ""),
                purchase.get("whatsapp", "N/A"),
                purchase.get("transaction_id", "N/A"),
                purchase.get("created_at", "N/A"),
                f"${purchase.get('value', 15.0)}",
                purchase.get("currency", "USD"),
                quiz_answers.get("1", "N/A") if isinstance(quiz_answers, dict) else "N/A",
                quiz_answers.get("3", "N/A") if isinstance(quiz_answers, dict) else "N/A",
                quiz_answers.get("4", "N/A") if isinstance(quiz_answers, dict) else "N/A",
                quiz_answers.get("5", "N/A") if isinstance(quiz_answers, dict) else "N/A",
                purchase.get("client_ip", "N/A"),
                purchase.get("user_agent", "N/A"),
                purchase.get("session_id", "N/A"),
                purchase.get("utm_source", "N/A"),
                purchase.get("utm_medium", "N/A"),
                purchase.get("utm_campaign", "N/A"),
                purchase.get("utm_content", "N/A"),
                purchase.get("utm_term", "N/A"),
                purchase.get("fbclid", "N/A"),
                purchase.get("_fbc", "N/A"),
                purchase.get("_fbp", "N/A"),
                purchase.get("referrer", "N/A"),
                purchase.get("current_url", "N/A"),
                purchase.get("timestamp", "N/A")
            ]
            writer.writerow(row)
        
        csv_content = output.getvalue()
        output.close()
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=purchases_completo.csv"}
        )
        
    except Exception as e:
        print(f"Error exporting purchases CSV: {e}")
        return {"error": str(e)}

# Endpoint to get client IP
@api_router.get("/get-client-ip")
async def get_client_ip(request: Request):
    # Get real client IP considering proxies
    client_ip = request.client.host
    
    # Check proxy headers
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        client_ip = real_ip
    
    return {"ip": client_ip}

# Webhook for Lead Capture (InitiateCheckout)
@api_router.post("/webhooks/lead-capture")
async def lead_capture_webhook(webhook_data: LeadCaptureWebhook, request: Request):
    try:
        # Get client IP
        client_ip = request.client.host
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        
        # Prepare data for Supabase
        webhook_dict = {
            "session_id": str(uuid.uuid4()),
            "name": webhook_data.name,
            "email": webhook_data.email,
            "whatsapp": webhook_data.whatsapp,
            "user_agent": webhook_data.userAgent,
            "fbclid": webhook_data.fbclid,
            "_fbc": webhook_data._fbc,
            "_fbp": webhook_data._fbp,
            "utm_source": webhook_data.utmSource,
            "utm_medium": webhook_data.utmMedium,
            "utm_campaign": webhook_data.utmCampaign,
            "utm_content": webhook_data.utmContent,
            "utm_term": webhook_data.utmTerm,
            "referrer": webhook_data.referrer,
            "quiz_answers": webhook_data.quizAnswers or {},
            "bucket_id": webhook_data.bucketId,
            "event_type": webhook_data.eventType,
            "value": webhook_data.value,
            "currency": webhook_data.currency,
            "client_ip": client_ip,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Save to Supabase
        result = supabase.table('lead_webhooks').insert(webhook_dict).execute()
        
        if not result.data:
            raise Exception("Failed to insert lead webhook data")
        
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

# Webhook for Purchase
@api_router.post("/webhooks/purchase") 
async def purchase_webhook(webhook_data: PurchaseWebhook, request: Request):
    try:
        # Get client IP
        client_ip = request.client.host
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        
        # Prepare data for Supabase
        webhook_dict = {
            "session_id": str(uuid.uuid4()),
            "name": webhook_data.name,
            "email": webhook_data.email,
            "whatsapp": webhook_data.whatsapp,
            "transaction_id": webhook_data.transactionId,
            "order_id": webhook_data.orderId,
            "user_agent": webhook_data.userAgent,
            "fbclid": webhook_data.fbclid,
            "_fbc": webhook_data._fbc,
            "_fbp": webhook_data._fbp,
            "utm_source": webhook_data.utmSource,
            "utm_medium": webhook_data.utmMedium,
            "utm_campaign": webhook_data.utmCampaign,
            "utm_content": webhook_data.utmContent,
            "utm_term": webhook_data.utmTerm,
            "referrer": webhook_data.referrer,
            "event_type": webhook_data.eventType,
            "value": webhook_data.value,
            "currency": webhook_data.currency,
            "payment_method": webhook_data.paymentMethod,
            "client_ip": client_ip,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Save to Supabase
        result = supabase.table('purchase_webhooks').insert(webhook_dict).execute()
        
        if not result.data:
            raise Exception("Failed to insert purchase webhook data")
        
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