#!/usr/bin/env python3
"""
Simple test to verify endpoints are working
"""

import requests

def test_endpoints():
    """Test if endpoints are available"""
    print("🧪 Testing endpoint availability...")
    
    # Test health endpoint
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        return
    
    # Test if profiles endpoint exists
    try:
        response = requests.get("http://localhost:8000/profiles/me", timeout=5)
        if response.status_code == 401:  # Unauthorized is expected without token
            print("✅ Profiles endpoint exists (401 expected without auth)")
        elif response.status_code == 404:
            print("❌ Profiles endpoint not found - server may need restart")
        else:
            print(f"⚠️  Profiles endpoint returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Profiles endpoint test failed: {e}")
    
    # Test if moods endpoint exists
    try:
        response = requests.get("http://localhost:8000/moods/", timeout=5)
        if response.status_code == 401:  # Unauthorized is expected without token
            print("✅ Moods endpoint exists (401 expected without auth)")
        elif response.status_code == 404:
            print("❌ Moods endpoint not found - server may need restart")
        else:
            print(f"⚠️  Moods endpoint returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Moods endpoint test failed: {e}")
    
    # Test if predictions endpoint exists
    try:
        response = requests.get("http://localhost:8000/predictions/current", timeout=5)
        if response.status_code == 401:  # Unauthorized is expected without token
            print("✅ Predictions endpoint exists (401 expected without auth)")
        elif response.status_code == 404:
            print("❌ Predictions endpoint not found - server may need restart")
        else:
            print(f"⚠️  Predictions endpoint returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Predictions endpoint test failed: {e}")

if __name__ == "__main__":
    test_endpoints()
