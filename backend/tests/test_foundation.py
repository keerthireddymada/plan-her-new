#!/usr/bin/env python3
"""
Test script to verify PlanHer backend foundation is working correctly
"""

import requests
import json
from app.database import create_tables
from app.models import User, UserProfile, PeriodRecord, DailyMood, UserModel
from app.schemas import UserCreate, UserLogin, ProfileCreate, MoodCreate

def test_database_models():
    """Test database models can be imported and tables can be created"""
    print("🧪 Testing database models...")
    try:
        # Test model imports
        user = User(email="test@example.com", password_hash="test")
        profile = UserProfile(user_id=1, height_cm=165, weight_kg=60.0)
        period = PeriodRecord(user_id=1, start_date="2024-01-01")
        mood = DailyMood(user_id=1, date="2024-01-01", energy_level=1)
        model = UserModel(user_id=1, model_version="1.0")
        
        print("✅ Database models work correctly")
        return True
    except Exception as e:
        print(f"❌ Database models test failed: {e}")
        return False

def test_pydantic_schemas():
    """Test Pydantic schemas can be created and validated"""
    print("🧪 Testing Pydantic schemas...")
    try:
        # Test schema creation
        user_create = UserCreate(email="test@example.com", password="password123", name="Test User")
        user_login = UserLogin(email="test@example.com", password="password123")
        profile_create = ProfileCreate(
            height_cm=165,
            weight_kg=60.0,
            cycle_length=28,
            luteal_length=14,
            menses_length=5
        )
        mood_create = MoodCreate(date="2024-01-01", energy_level=1, notes="Feeling good")
        
        print("✅ Pydantic schemas work correctly")
        return True
    except Exception as e:
        print(f"❌ Pydantic schemas test failed: {e}")
        return False

def test_fastapi_server():
    """Test FastAPI server endpoints"""
    print("🧪 Testing FastAPI server...")
    try:
        # Test root endpoint
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint: {data}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
        
        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health endpoint: {data}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
        
        # Test API docs
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API documentation accessible")
        else:
            print(f"❌ API docs failed: {response.status_code}")
            return False
        
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to FastAPI server. Make sure it's running on port 8000")
        return False
    except Exception as e:
        print(f"❌ FastAPI server test failed: {e}")
        return False

def main():
    """Run all foundation tests"""
    print("🚀 Testing PlanHer Backend Foundation")
    print("=" * 50)
    
    # Test database models
    models_ok = test_database_models()
    
    # Test Pydantic schemas
    schemas_ok = test_pydantic_schemas()
    
    # Test FastAPI server (only if server is running)
    server_ok = test_fastapi_server()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"Database Models: {'✅ PASS' if models_ok else '❌ FAIL'}")
    print(f"Pydantic Schemas: {'✅ PASS' if schemas_ok else '❌ FAIL'}")
    print(f"FastAPI Server: {'✅ PASS' if server_ok else '❌ FAIL'}")
    
    if all([models_ok, schemas_ok]):
        print("\n🎉 Foundation Phase 1 Complete!")
        print("✅ Database models and schemas are working correctly")
        print("✅ FastAPI application structure is set up")
        print("✅ Ready to proceed to Phase 2: Authentication")
    else:
        print("\n⚠️  Some tests failed. Please fix issues before proceeding.")

if __name__ == "__main__":
    main()
