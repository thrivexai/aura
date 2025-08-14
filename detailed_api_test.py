#!/usr/bin/env python3
"""
Detailed API Testing - Verify data structure and content
"""

import requests
import json

BACKEND_URL = "https://aura-fashion-quiz.preview.emergentagent.com"

def detailed_test():
    print("🔍 DETAILED API STRUCTURE VERIFICATION")
    
    # Test leads endpoint
    print("\n--- LEADS ENDPOINT ---")
    response = requests.get(f"{BACKEND_URL}/api/leads")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Structure: {list(data.keys())}")
        print(f"✅ Total leads: {data['total']}")
        if data['leads']:
            print(f"✅ Sample lead structure: {list(data['leads'][0].keys())}")
            print(f"✅ Sample lead data: {json.dumps(data['leads'][0], indent=2)}")
    
    # Test purchases endpoint  
    print("\n--- PURCHASES ENDPOINT ---")
    response = requests.get(f"{BACKEND_URL}/api/purchases")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Structure: {list(data.keys())}")
        print(f"✅ Total purchases: {data['total']}")
        if data['purchases']:
            print(f"✅ Sample purchase structure: {list(data['purchases'][0].keys())}")
            print(f"✅ Sample purchase data: {json.dumps(data['purchases'][0], indent=2)}")
    
    # Test metrics endpoint
    print("\n--- METRICS ENDPOINT ---")
    response = requests.get(f"{BACKEND_URL}/api/metrics")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Metrics structure: {list(data.keys())}")
        print(f"✅ Metrics data: {json.dumps(data, indent=2)}")

if __name__ == "__main__":
    detailed_test()