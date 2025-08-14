#!/usr/bin/env python3
"""
Backend API Testing Script for Admin Panel Endpoints
Tests the new API endpoints: /api/leads, /api/purchases, /api/metrics, /api/export-leads-csv, /api/export-purchases-csv
"""

import requests
import json
import sys
import csv
from io import StringIO
from datetime import datetime

# Use the production backend URL from frontend/.env
BACKEND_URL = "https://aura-fashion-quiz.preview.emergentagent.com"

def test_api_endpoint(endpoint, expected_keys=None):
    """Test a single API endpoint"""
    url = f"{BACKEND_URL}/api/{endpoint}"
    print(f"\n{'='*60}")
    print(f"Testing: {url}")
    print(f"{'='*60}")
    
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
                
                # Print sample data structure
                if isinstance(data, dict):
                    for key, value in data.items():
                        if isinstance(value, list):
                            print(f"  {key}: List with {len(value)} items")
                            if value:  # If list is not empty, show first item structure
                                print(f"    Sample item keys: {list(value[0].keys()) if isinstance(value[0], dict) else 'Not dict items'}")
                        else:
                            print(f"  {key}: {value}")
                
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
    """Test GET /api/leads endpoint with expanded tracking data"""
    print("\n🔍 TESTING LEADS ENDPOINT WITH EXPANDED TRACKING DATA")
    
    url = f"{BACKEND_URL}/api/leads"
    print(f"Testing: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Type: {type(data)}")
            
            # Check main structure
            expected_main_keys = ["leads", "total"]
            if not all(key in data for key in expected_main_keys):
                print(f"❌ Missing main keys. Expected: {expected_main_keys}, Got: {list(data.keys())}")
                return False
            
            print(f"✅ Main structure correct: {expected_main_keys}")
            print(f"Total leads: {data['total']}")
            
            # Check individual lead structure if leads exist
            if data['leads']:
                lead = data['leads'][0]
                print(f"\n📋 CHECKING LEAD DATA STRUCTURE:")
                
                # Basic data fields
                basic_fields = ['id', 'name', 'email', 'whatsapp', 'businessType', 'stage', 'createdAt']
                # Tracking data fields
                tracking_fields = ['ip', 'userAgent', 'sessionId']
                # UTM parameters
                utm_fields = ['utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm']
                # Facebook tracking
                fb_fields = ['fbclid', '_fbc', '_fbp']
                # Additional data
                additional_fields = ['referrer', 'currentUrl']
                
                all_expected_fields = basic_fields + tracking_fields + utm_fields + fb_fields + additional_fields
                
                print(f"Lead keys present: {list(lead.keys())}")
                
                # Check each category
                missing_basic = [f for f in basic_fields if f not in lead]
                missing_tracking = [f for f in tracking_fields if f not in lead]
                missing_utm = [f for f in utm_fields if f not in lead]
                missing_fb = [f for f in fb_fields if f not in lead]
                missing_additional = [f for f in additional_fields if f not in lead]
                
                print(f"✅ Basic fields: {[f for f in basic_fields if f in lead]}")
                if missing_basic:
                    print(f"❌ Missing basic fields: {missing_basic}")
                
                print(f"✅ Tracking fields: {[f for f in tracking_fields if f in lead]}")
                if missing_tracking:
                    print(f"❌ Missing tracking fields: {missing_tracking}")
                
                print(f"✅ UTM fields: {[f for f in utm_fields if f in lead]}")
                if missing_utm:
                    print(f"❌ Missing UTM fields: {missing_utm}")
                
                print(f"✅ Facebook fields: {[f for f in fb_fields if f in lead]}")
                if missing_fb:
                    print(f"❌ Missing Facebook fields: {missing_fb}")
                
                print(f"✅ Additional fields: {[f for f in additional_fields if f in lead]}")
                if missing_additional:
                    print(f"❌ Missing additional fields: {missing_additional}")
                
                # Show sample values
                print(f"\n📊 SAMPLE LEAD DATA:")
                for field in all_expected_fields:
                    if field in lead:
                        value = lead[field]
                        if value is not None:
                            print(f"  {field}: {value}")
                        else:
                            print(f"  {field}: null")
                
                # All fields should be present (even if null)
                missing_all = [f for f in all_expected_fields if f not in lead]
                if missing_all:
                    print(f"❌ Missing expected fields: {missing_all}")
                    return False
                else:
                    print(f"✅ All expected tracking fields present in response structure")
                    return True
            else:
                print("ℹ️  No leads in database - structure test passed but no data to verify")
                return True
                
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def test_purchases_endpoint():
    """Test GET /api/purchases endpoint with expanded tracking data"""
    print("\n🔍 TESTING PURCHASES ENDPOINT WITH EXPANDED TRACKING DATA")
    
    url = f"{BACKEND_URL}/api/purchases"
    print(f"Testing: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Type: {type(data)}")
            
            # Check main structure
            expected_main_keys = ["purchases", "total"]
            if not all(key in data for key in expected_main_keys):
                print(f"❌ Missing main keys. Expected: {expected_main_keys}, Got: {list(data.keys())}")
                return False
            
            print(f"✅ Main structure correct: {expected_main_keys}")
            print(f"Total purchases: {data['total']}")
            
            # Check individual purchase structure if purchases exist
            if data['purchases']:
                purchase = data['purchases'][0]
                print(f"\n📋 CHECKING PURCHASE DATA STRUCTURE:")
                
                # Basic data fields
                basic_fields = ['id', 'name', 'email', 'whatsapp', 'businessType', 'stage', 'createdAt']
                # Purchase specific fields
                purchase_fields = ['transactionId', 'amount']
                # Tracking data fields
                tracking_fields = ['ip', 'userAgent', 'sessionId']
                # UTM parameters
                utm_fields = ['utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm']
                # Facebook tracking
                fb_fields = ['fbclid', '_fbc', '_fbp']
                # Additional data
                additional_fields = ['referrer', 'currentUrl']
                
                all_expected_fields = basic_fields + purchase_fields + tracking_fields + utm_fields + fb_fields + additional_fields
                
                print(f"Purchase keys present: {list(purchase.keys())}")
                
                # Check each category
                missing_basic = [f for f in basic_fields if f not in purchase]
                missing_purchase = [f for f in purchase_fields if f not in purchase]
                missing_tracking = [f for f in tracking_fields if f not in purchase]
                missing_utm = [f for f in utm_fields if f not in purchase]
                missing_fb = [f for f in fb_fields if f not in purchase]
                missing_additional = [f for f in additional_fields if f not in purchase]
                
                print(f"✅ Basic fields: {[f for f in basic_fields if f in purchase]}")
                if missing_basic:
                    print(f"❌ Missing basic fields: {missing_basic}")
                
                print(f"✅ Purchase fields: {[f for f in purchase_fields if f in purchase]}")
                if missing_purchase:
                    print(f"❌ Missing purchase fields: {missing_purchase}")
                
                print(f"✅ Tracking fields: {[f for f in tracking_fields if f in purchase]}")
                if missing_tracking:
                    print(f"❌ Missing tracking fields: {missing_tracking}")
                
                print(f"✅ UTM fields: {[f for f in utm_fields if f in purchase]}")
                if missing_utm:
                    print(f"❌ Missing UTM fields: {missing_utm}")
                
                print(f"✅ Facebook fields: {[f for f in fb_fields if f in purchase]}")
                if missing_fb:
                    print(f"❌ Missing Facebook fields: {missing_fb}")
                
                print(f"✅ Additional fields: {[f for f in additional_fields if f in purchase]}")
                if missing_additional:
                    print(f"❌ Missing additional fields: {missing_additional}")
                
                # Show sample values
                print(f"\n📊 SAMPLE PURCHASE DATA:")
                for field in all_expected_fields:
                    if field in purchase:
                        value = purchase[field]
                        if value is not None:
                            print(f"  {field}: {value}")
                        else:
                            print(f"  {field}: null")
                
                # All fields should be present (even if null)
                missing_all = [f for f in all_expected_fields if f not in purchase]
                if missing_all:
                    print(f"❌ Missing expected fields: {missing_all}")
                    return False
                else:
                    print(f"✅ All expected tracking fields present in response structure")
                    return True
            else:
                print("ℹ️  No purchases in database - structure test passed but no data to verify")
                return True
                
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def test_metrics_endpoint():
    """Test GET /api/metrics endpoint"""
    print("\n🔍 TESTING METRICS ENDPOINT")
    expected_keys = ["totalVisitors", "leadsGenerated", "purchases", "conversionRate"]
    return test_api_endpoint("metrics", expected_keys)

def test_csv_export_leads():
    """Test GET /api/export-leads-csv endpoint"""
    print("\n🔍 TESTING CSV EXPORT LEADS ENDPOINT")
    
    url = f"{BACKEND_URL}/api/export-leads-csv"
    print(f"Testing: {url}")
    
    try:
        response = requests.get(url, timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            # Check Content-Type header
            content_type = response.headers.get('content-type', '')
            print(f"Content-Type: {content_type}")
            
            if 'text/csv' not in content_type:
                print(f"❌ Expected text/csv content type, got: {content_type}")
                return False
            
            # Check Content-Disposition header
            content_disposition = response.headers.get('content-disposition', '')
            print(f"Content-Disposition: {content_disposition}")
            
            if 'attachment' not in content_disposition or 'filename=' not in content_disposition:
                print(f"❌ Missing or invalid Content-Disposition header")
                return False
            
            # Parse CSV content properly
            csv_content = response.text
            csv_reader = csv.reader(StringIO(csv_content))
            rows = list(csv_reader)
            
            if not rows:
                print("❌ Empty CSV content")
                return False
            
            # Check headers
            headers = rows[0]
            expected_headers = [
                'Nombre', 'Email', 'WhatsApp', 'Tipo Negocio', 'Costo Principal', 'Objetivo', 'Uso IA', 'Etapa', 'Fecha Creacion',
                'IP', 'User Agent', 'Session ID', 'Referrer', 'URL Actual',
                'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
                'fbclid', '_fbc', '_fbp',
                'Transaction ID', 'Valor', 'Moneda', 'Timestamp Completo'
            ]
            
            print(f"CSV Headers ({len(headers)}): {headers[:5]}... (showing first 5)")
            print(f"Expected Headers ({len(expected_headers)}): {expected_headers[:5]}... (showing first 5)")
            
            # Check if all expected headers are present
            missing_headers = []
            for expected in expected_headers:
                if expected not in headers:
                    missing_headers.append(expected)
            
            if missing_headers:
                print(f"❌ Missing headers: {missing_headers}")
                return False
            
            print(f"✅ All expected headers present")
            print(f"Total CSV rows: {len(rows)} (including header)")
            
            # Check for real data (not all N/A values) if there are data rows
            if len(rows) > 1:
                print("\n📊 CHECKING CSV DATA CONTENT:")
                data_row = rows[1]
                
                # Create header-to-index mapping
                header_map = {header: idx for idx, header in enumerate(headers)}
                
                # Check specific tracking fields for real data
                tracking_fields = ['IP', 'User Agent', 'Session ID', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'fbclid', '_fbc', '_fbp']
                real_data_count = 0
                
                for field in tracking_fields:
                    if field in header_map:
                        idx = header_map[field]
                        if idx < len(data_row):
                            value = data_row[idx].strip()
                            if value and value not in ['N/A', '', 'null']:
                                real_data_count += 1
                                print(f"  Real data in {field}: {value}")
                            else:
                                print(f"  {field}: {value or 'N/A'}")
                
                print(f"Real tracking data fields: {real_data_count}/{len(tracking_fields)}")
                
                # Also check basic data
                basic_fields = ['Nombre', 'Email']
                for field in basic_fields:
                    if field in header_map:
                        idx = header_map[field]
                        if idx < len(data_row):
                            value = data_row[idx].strip()
                            print(f"  {field}: {value}")
                
                if real_data_count > 0:
                    print("✅ CSV contains some real tracking data")
                else:
                    print("⚠️  CSV contains mostly N/A values - may indicate missing webhook data")
            else:
                print("ℹ️  No data rows in CSV - only headers present")
            
            print("✅ CSV export leads endpoint working correctly")
            return True
            
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def test_csv_export_purchases():
    """Test GET /api/export-purchases-csv endpoint"""
    print("\n🔍 TESTING CSV EXPORT PURCHASES ENDPOINT")
    
    url = f"{BACKEND_URL}/api/export-purchases-csv"
    print(f"Testing: {url}")
    
    try:
        response = requests.get(url, timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            # Check Content-Type header
            content_type = response.headers.get('content-type', '')
            print(f"Content-Type: {content_type}")
            
            if 'text/csv' not in content_type:
                print(f"❌ Expected text/csv content type, got: {content_type}")
                return False
            
            # Check Content-Disposition header
            content_disposition = response.headers.get('content-disposition', '')
            print(f"Content-Disposition: {content_disposition}")
            
            if 'attachment' not in content_disposition or 'filename=' not in content_disposition:
                print(f"❌ Missing or invalid Content-Disposition header")
                return False
            
            # Parse CSV content properly
            csv_content = response.text
            csv_reader = csv.reader(StringIO(csv_content))
            rows = list(csv_reader)
            
            if not rows:
                print("❌ Empty CSV content")
                return False
            
            # Check headers
            headers = rows[0]
            expected_headers = [
                'Nombre', 'Email', 'WhatsApp', 'Transaction ID', 'Fecha', 'Valor', 'Moneda',
                'Tipo Negocio', 'Costo Principal', 'Objetivo', 'Uso IA',
                'IP', 'User Agent', 'Session ID',
                'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
                'fbclid', '_fbc', '_fbp',
                'Referrer', 'URL Actual', 'Timestamp Completo'
            ]
            
            print(f"CSV Headers ({len(headers)}): {headers[:5]}... (showing first 5)")
            print(f"Expected Headers ({len(expected_headers)}): {expected_headers[:5]}... (showing first 5)")
            
            # Check if all expected headers are present
            missing_headers = []
            for expected in expected_headers:
                if expected not in headers:
                    missing_headers.append(expected)
            
            if missing_headers:
                print(f"❌ Missing headers: {missing_headers}")
                return False
            
            print(f"✅ All expected headers present")
            print(f"Total CSV rows: {len(rows)} (including header)")
            
            # Check for real data (not all N/A values) if there are data rows
            if len(rows) > 1:
                print("\n📊 CHECKING CSV DATA CONTENT:")
                data_row = rows[1]
                
                # Create header-to-index mapping
                header_map = {header: idx for idx, header in enumerate(headers)}
                
                # Check specific tracking fields for real data
                tracking_fields = ['IP', 'User Agent', 'Session ID', 'Transaction ID', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'fbclid', '_fbc', '_fbp']
                real_data_count = 0
                
                for field in tracking_fields:
                    if field in header_map:
                        idx = header_map[field]
                        if idx < len(data_row):
                            value = data_row[idx].strip()
                            if value and value not in ['N/A', '', 'null']:
                                real_data_count += 1
                                print(f"  Real data in {field}: {value}")
                            else:
                                print(f"  {field}: {value or 'N/A'}")
                
                print(f"Real tracking data fields: {real_data_count}/{len(tracking_fields)}")
                
                # Also check basic data
                basic_fields = ['Nombre', 'Email', 'Transaction ID', 'Valor']
                for field in basic_fields:
                    if field in header_map:
                        idx = header_map[field]
                        if idx < len(data_row):
                            value = data_row[idx].strip()
                            print(f"  {field}: {value}")
                
                if real_data_count > 0:
                    print("✅ CSV contains some real tracking data")
                else:
                    print("⚠️  CSV contains mostly N/A values - may indicate missing webhook data")
            else:
                print("ℹ️  No data rows in CSV - only headers present")
            
            print("✅ CSV export purchases endpoint working correctly")
            return True
            
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def test_error_handling():
    """Test error handling with invalid endpoint"""
    print("\n🔍 TESTING ERROR HANDLING")
    url = f"{BACKEND_URL}/api/nonexistent"
    try:
        response = requests.get(url, timeout=10)
        print(f"Invalid endpoint status: {response.status_code}")
        if response.status_code == 404:
            print("✅ Proper 404 error handling")
            return True
        else:
            print(f"❌ Unexpected status code for invalid endpoint: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing invalid endpoint: {e}")
        return False

def main():
    """Run all backend API tests"""
    print(f"🚀 BACKEND API TESTING STARTED")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    results = {
        "leads": False,
        "purchases": False, 
        "metrics": False,
        "csv_export_leads": False,
        "csv_export_purchases": False,
        "error_handling": False
    }
    
    # Test each endpoint
    results["leads"] = test_leads_endpoint()
    results["purchases"] = test_purchases_endpoint()
    results["metrics"] = test_metrics_endpoint()
    results["csv_export_leads"] = test_csv_export_leads()
    results["csv_export_purchases"] = test_csv_export_purchases()
    results["error_handling"] = test_error_handling()
    
    # Summary
    print(f"\n{'='*60}")
    print("🏁 TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{test_name.upper()}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED!")
        return 0
    else:
        print("⚠️  SOME TESTS FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())