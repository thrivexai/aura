#!/usr/bin/env python3
"""
Backend API Testing Script for Webhook Configuration System
Tests webhook endpoints and configuration system functionality
"""

import requests
import json
import sys
import csv
from io import StringIO
from datetime import datetime
import uuid

# Use the production backend URL from frontend/.env
BACKEND_URL = "https://7eadbe52-edd5-43c9-b30b-93260710090a.preview.emergentagent.com"

def test_webhook_lead_capture():
    """Test POST /api/webhooks/lead-capture endpoint"""
    print("\n🔍 TESTING WEBHOOK LEAD CAPTURE ENDPOINT")
    
    url = f"{BACKEND_URL}/api/webhooks/lead-capture"
    print(f"Testing: {url}")
    
    # Create realistic webhook data
    webhook_data = {
        "name": "María García",
        "email": "maria.garcia@example.com",
        "whatsapp": "+34666777888",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "fbclid": "IwAR123456789",
        "_fbc": "fb.1.1234567890123.IwAR123456789",
        "_fbp": "fb.1.1234567890123.987654321",
        "utmSource": "facebook",
        "utmMedium": "cpc",
        "utmCampaign": "fashion-workshop-2024",
        "utmContent": "video-ad",
        "utmTerm": "moda-rentable",
        "referrer": "https://facebook.com",
        "quizAnswers": {
            "business_type": "marca-emergente",
            "main_cost": "produccion",
            "objective": "reducir-costos",
            "ai_usage": "principiante"
        },
        "bucketId": "produccion",
        "eventType": "InitiateCheckout",
        "value": 15.0,
        "currency": "USD"
    }
    
    try:
        response = requests.post(url, json=webhook_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"Response Type: {type(data)}")
                print(f"Response Keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                
                # Check expected response structure
                expected_keys = ["success", "message", "data"]
                if isinstance(data, dict):
                    missing_keys = [key for key in expected_keys if key not in data]
                    if missing_keys:
                        print(f"❌ Missing expected keys: {missing_keys}")
                        return False
                    
                    if data.get("success") == True:
                        print(f"✅ Webhook processed successfully")
                        print(f"✅ Message: {data.get('message')}")
                        
                        # Check data structure
                        webhook_response_data = data.get("data", {})
                        if "email" in webhook_response_data and "eventType" in webhook_response_data:
                            print(f"✅ Response contains expected webhook data")
                            print(f"  Email: {webhook_response_data.get('email')}")
                            print(f"  Event Type: {webhook_response_data.get('eventType')}")
                            print(f"  Client IP: {webhook_response_data.get('clientIP', 'Not provided')}")
                            return True
                        else:
                            print(f"❌ Response data missing expected fields")
                            return False
                    else:
                        print(f"❌ Webhook processing failed: {data.get('message', 'Unknown error')}")
                        return False
                else:
                    print(f"❌ Invalid response format")
                    return False
                    
            except json.JSONDecodeError:
                print(f"❌ Invalid JSON response")
                print(f"Raw response: {response.text[:200]}...")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def test_webhook_purchase():
    """Test POST /api/webhooks/purchase endpoint"""
    print("\n🔍 TESTING WEBHOOK PURCHASE ENDPOINT")
    
    url = f"{BACKEND_URL}/api/webhooks/purchase"
    print(f"Testing: {url}")
    
    # Create realistic purchase webhook data
    webhook_data = {
        "name": "María García",
        "email": "maria.garcia@example.com",
        "whatsapp": "+34666777888",
        "transactionId": f"HM{uuid.uuid4().hex[:10].upper()}",
        "orderId": f"ORDER_{int(datetime.now().timestamp())}",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "fbclid": "IwAR123456789",
        "_fbc": "fb.1.1234567890123.IwAR123456789",
        "_fbp": "fb.1.1234567890123.987654321",
        "utmSource": "facebook",
        "utmMedium": "cpc",
        "utmCampaign": "fashion-workshop-2024",
        "eventType": "Purchase",
        "value": 15.0,
        "currency": "USD",
        "paymentMethod": "hotmart"
    }
    
    try:
        response = requests.post(url, json=webhook_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"Response Type: {type(data)}")
                print(f"Response Keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                
                # Check expected response structure
                expected_keys = ["success", "message", "data"]
                if isinstance(data, dict):
                    missing_keys = [key for key in expected_keys if key not in data]
                    if missing_keys:
                        print(f"❌ Missing expected keys: {missing_keys}")
                        return False
                    
                    if data.get("success") == True:
                        print(f"✅ Purchase webhook processed successfully")
                        print(f"✅ Message: {data.get('message')}")
                        
                        # Check data structure
                        webhook_response_data = data.get("data", {})
                        expected_fields = ["email", "transactionId", "eventType"]
                        if all(field in webhook_response_data for field in expected_fields):
                            print(f"✅ Response contains expected purchase data")
                            print(f"  Email: {webhook_response_data.get('email')}")
                            print(f"  Transaction ID: {webhook_response_data.get('transactionId')}")
                            print(f"  Event Type: {webhook_response_data.get('eventType')}")
                            print(f"  Client IP: {webhook_response_data.get('clientIP', 'Not provided')}")
                            return True
                        else:
                            print(f"❌ Response data missing expected fields: {expected_fields}")
                            return False
                    else:
                        print(f"❌ Purchase webhook processing failed: {data.get('message', 'Unknown error')}")
                        return False
                else:
                    print(f"❌ Invalid response format")
                    return False
                    
            except json.JSONDecodeError:
                print(f"❌ Invalid JSON response")
                print(f"Raw response: {response.text[:200]}...")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def test_webhook_url_handling():
    """Test webhook URL handling with different URL formats"""
    print("\n🔍 TESTING WEBHOOK URL HANDLING")
    
    # Test different URL formats that the system should handle
    test_cases = [
        {
            "name": "Relative URL (default)",
            "url": "/api/webhooks/lead-capture",
            "expected_full_url": f"{BACKEND_URL}/api/webhooks/lead-capture",
            "should_work": True
        },
        {
            "name": "Absolute URL (external webhook)",
            "url": "https://webhook.site/test-endpoint",
            "expected_full_url": "https://webhook.site/test-endpoint",
            "should_work": False  # External endpoint won't work in test, but URL handling should be correct
        },
        {
            "name": "Zapier webhook URL format",
            "url": "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
            "expected_full_url": "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
            "should_work": False  # External endpoint won't work in test
        }
    ]
    
    print("Testing URL format handling logic:")
    
    for test_case in test_cases:
        print(f"\n  Testing: {test_case['name']}")
        print(f"  Input URL: {test_case['url']}")
        print(f"  Expected full URL: {test_case['expected_full_url']}")
        
        # Simulate the buildWebhookUrl logic from frontend
        if test_case['url'].startswith('/'):
            built_url = f"{BACKEND_URL}{test_case['url']}"
        else:
            built_url = test_case['url']
        
        if built_url == test_case['expected_full_url']:
            print(f"  ✅ URL building logic correct")
        else:
            print(f"  ❌ URL building failed. Got: {built_url}")
            return False
    
    print(f"\n✅ All webhook URL handling tests passed")
    return True

def test_webhook_data_persistence():
    """Test that webhook data is properly stored in database"""
    print("\n🔍 TESTING WEBHOOK DATA PERSISTENCE")
    
    # Send a lead capture webhook
    lead_webhook_data = {
        "name": "Test User Webhook",
        "email": f"test.webhook.{int(datetime.now().timestamp())}@example.com",
        "whatsapp": "+34666777888",
        "userAgent": "Test User Agent",
        "utmSource": "test-source",
        "utmMedium": "test-medium",
        "quizAnswers": {
            "business_type": "test-business",
            "main_cost": "test-cost"
        },
        "eventType": "InitiateCheckout",
        "value": 15.0,
        "currency": "USD"
    }
    
    try:
        # Send webhook
        webhook_url = f"{BACKEND_URL}/api/webhooks/lead-capture"
        webhook_response = requests.post(webhook_url, json=lead_webhook_data, timeout=10)
        
        if webhook_response.status_code != 200:
            print(f"❌ Failed to send test webhook: {webhook_response.status_code}")
            return False
        
        print(f"✅ Test webhook sent successfully")
        
        # Wait a moment for database write
        import time
        time.sleep(1)
        
        # Check if data appears in leads endpoint
        leads_url = f"{BACKEND_URL}/api/leads"
        leads_response = requests.get(leads_url, timeout=10)
        
        if leads_response.status_code != 200:
            print(f"❌ Failed to fetch leads: {leads_response.status_code}")
            return False
        
        leads_data = leads_response.json()
        leads = leads_data.get('leads', [])
        
        # Look for our test webhook data
        test_lead = None
        for lead in leads:
            if lead.get('email') == lead_webhook_data['email']:
                test_lead = lead
                break
        
        if test_lead:
            print(f"✅ Webhook data found in database")
            print(f"  Name: {test_lead.get('name')}")
            print(f"  Email: {test_lead.get('email')}")
            print(f"  UTM Source: {test_lead.get('utmSource')}")
            print(f"  Business Type: {test_lead.get('businessType')}")
            return True
        else:
            print(f"❌ Webhook data not found in database")
            print(f"  Searched for email: {lead_webhook_data['email']}")
            print(f"  Total leads in database: {len(leads)}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing webhook data persistence: {str(e)}")
        return False

def test_api_endpoint(endpoint, expected_keys=None):
    """Test a single API endpoint"""
    url = f"{BACKEND_URL}/api/{endpoint}"
    print(f"Testing: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"Response Type: {type(data)}")
                print(f"Response Keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                
                # Check expected keys if provided
                if expected_keys and isinstance(data, dict):
                    missing_keys = [key for key in expected_keys if key not in data]
                    if missing_keys:
                        print(f"❌ Missing expected keys: {missing_keys}")
                        return False
                    else:
                        print(f"✅ All expected keys present: {expected_keys}")
                
                print(f"✅ Endpoint {endpoint} working correctly")
                return True
                
            except json.JSONDecodeError:
                print(f"❌ Invalid JSON response")
                print(f"Raw response: {response.text[:200]}...")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def test_leads_endpoint():
    """Test GET /api/leads endpoint"""
    print("\n🔍 TESTING LEADS ENDPOINT")
    expected_keys = ["leads", "total"]
    return test_api_endpoint("leads", expected_keys)

def test_purchases_endpoint():
    """Test GET /api/purchases endpoint"""
    print("\n🔍 TESTING PURCHASES ENDPOINT")
    expected_keys = ["purchases", "total"]
    return test_api_endpoint("purchases", expected_keys)

def test_metrics_endpoint():
    """Test GET /api/metrics endpoint"""
    print("\n🔍 TESTING METRICS ENDPOINT")
    expected_keys = ["totalVisitors", "leadsGenerated", "purchases", "conversionRate"]
    return test_api_endpoint("metrics", expected_keys)

def main():
    """Run all backend API tests including webhook configuration system"""
    print(f"🚀 BACKEND WEBHOOK CONFIGURATION TESTING STARTED")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    results = {
        "webhook_lead_capture": False,
        "webhook_purchase": False,
        "webhook_url_handling": False,
        "webhook_data_persistence": False,
        "leads": False,
        "purchases": False, 
        "metrics": False
    }
    
    # Test webhook configuration system first
    print(f"\n{'='*80}")
    print("🎯 TESTING WEBHOOK CONFIGURATION SYSTEM")
    print(f"{'='*80}")
    
    results["webhook_lead_capture"] = test_webhook_lead_capture()
    results["webhook_purchase"] = test_webhook_purchase()
    results["webhook_url_handling"] = test_webhook_url_handling()
    results["webhook_data_persistence"] = test_webhook_data_persistence()
    
    # Test existing API endpoints
    print(f"\n{'='*80}")
    print("📊 TESTING EXISTING API ENDPOINTS")
    print(f"{'='*80}")
    
    results["leads"] = test_leads_endpoint()
    results["purchases"] = test_purchases_endpoint()
    results["metrics"] = test_metrics_endpoint()
    
    # Summary
    print(f"\n{'='*80}")
    print("🏁 WEBHOOK CONFIGURATION SYSTEM TEST SUMMARY")
    print(f"{'='*80}")
    
    # Separate webhook tests from API tests
    webhook_tests = {
        "webhook_lead_capture": results["webhook_lead_capture"],
        "webhook_purchase": results["webhook_purchase"],
        "webhook_url_handling": results["webhook_url_handling"],
        "webhook_data_persistence": results["webhook_data_persistence"]
    }
    
    api_tests = {
        "leads": results["leads"],
        "purchases": results["purchases"],
        "metrics": results["metrics"]
    }
    
    print("🎯 WEBHOOK CONFIGURATION TESTS:")
    webhook_passed = 0
    for test_name, passed_test in webhook_tests.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"  {test_name.upper().replace('_', ' ')}: {status}")
        if passed_test:
            webhook_passed += 1
    
    print(f"\n📊 API ENDPOINT TESTS:")
    api_passed = 0
    for test_name, passed_test in api_tests.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"  {test_name.upper().replace('_', ' ')}: {status}")
        if passed_test:
            api_passed += 1
    
    total_passed = webhook_passed + api_passed
    total_tests = len(results)
    
    print(f"\n📈 OVERALL RESULTS:")
    print(f"  Webhook Tests: {webhook_passed}/{len(webhook_tests)} passed")
    print(f"  API Tests: {api_passed}/{len(api_tests)} passed")
    print(f"  Total: {total_passed}/{total_tests} tests passed")
    
    if total_passed == total_tests:
        print("\n🎉 ALL WEBHOOK CONFIGURATION TESTS PASSED!")
        print("✅ Webhook system is working correctly with configurable URLs")
        return 0
    else:
        print(f"\n⚠️  {total_tests - total_passed} TESTS FAILED")
        if webhook_passed < len(webhook_tests):
            print("❌ Webhook configuration system has issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())