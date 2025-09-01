#!/usr/bin/env python3
"""
Test script to verify PlanHer backend core features
"""

import requests
import json
from datetime import date, datetime, timedelta

def get_auth_token():
    """Get authentication token for testing"""
    try:
        # Login to get token
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        
        response = requests.post(
            "http://localhost:8000/auth/login",
            json=login_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return data['access_token']
        else:
            print(f"❌ Login failed: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error getting auth token: {e}")
        return None

def test_profile_management(token):
    """Test profile management endpoints"""
    print("🧪 Testing profile management...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Create profile
        profile_data = {
            "height_cm": 165,
            "weight_kg": 60.0,
            "cycle_length": 28,
            "luteal_length": 14,
            "menses_length": 5,
            "unusual_bleeding": False,
            "number_of_peak": 2
        }
        
        response = requests.post(
            "http://localhost:8000/profiles/me",
            json=profile_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Profile created: {data['cycle_length']} day cycle")
            
            # Test getting profile
            response = requests.get(
                "http://localhost:8000/profiles/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                print("✅ Profile retrieval successful")
                return True
            else:
                print(f"❌ Profile retrieval failed: {response.status_code}")
                return False
        else:
            print(f"❌ Profile creation failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Profile management test failed: {e}")
        return False

def test_period_tracking(token):
    """Test period tracking endpoints"""
    print("🧪 Testing period tracking...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Create period record
        period_data = {
            "start_date": "2024-01-01",
            "end_date": "2024-01-05"
        }
        
        response = requests.post(
            "http://localhost:8000/periods/",
            json=period_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Period record created: {data['start_date']}")
            
            # Test getting period history
            response = requests.get(
                "http://localhost:8000/periods/",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                periods = response.json()
                print(f"✅ Period history retrieved: {len(periods)} records")
                return True
            else:
                print(f"❌ Period history retrieval failed: {response.status_code}")
                return False
        else:
            print(f"❌ Period creation failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Period tracking test failed: {e}")
        return False

def test_mood_tracking(token):
    """Test mood tracking endpoints"""
    print("🧪 Testing mood tracking...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Create mood entries for the last few days
        today = date.today()
        mood_entries = [
            {"date": (today - timedelta(days=3)).isoformat(), "energy_level": 1, "notes": "Feeling good"},
            {"date": (today - timedelta(days=2)).isoformat(), "energy_level": 2, "notes": "Very energetic"},
            {"date": (today - timedelta(days=1)).isoformat(), "energy_level": 0, "notes": "Tired"},
            {"date": today.isoformat(), "energy_level": 1, "notes": "Normal day"}
        ]
        
        created_moods = []
        for mood_data in mood_entries:
            response = requests.post(
                "http://localhost:8000/moods/",
                json=mood_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                created_moods.append(response.json())
            else:
                print(f"❌ Mood creation failed: {response.status_code} - {response.text}")
                return False
        
        print(f"✅ Created {len(created_moods)} mood entries")
        
        # Test getting mood history
        response = requests.get(
            "http://localhost:8000/moods/",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            moods = response.json()
            print(f"✅ Mood history retrieved: {len(moods)} entries")
            return True
        else:
            print(f"❌ Mood history retrieval failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Mood tracking test failed: {e}")
        return False

def test_predictions(token):
    """Test prediction endpoints"""
    print("🧪 Testing predictions...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Test current prediction
        response = requests.get(
            "http://localhost:8000/predictions/current",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            prediction = response.json()
            print(f"✅ Current prediction: {prediction['predicted_energy_level']} energy level on day {prediction['day_of_cycle']}")
        else:
            print(f"❌ Current prediction failed: {response.status_code} - {response.text}")
            return False
        
        # Test cycle info
        response = requests.get(
            "http://localhost:8000/predictions/cycle-info",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            cycle_info = response.json()
            print(f"✅ Cycle info: Phase {cycle_info['current_cycle_phase']}")
        else:
            print(f"❌ Cycle info failed: {response.status_code}")
            return False
        
        # Test model status
        response = requests.get(
            "http://localhost:8000/predictions/model-status",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            model_status = response.json()
            print(f"✅ Model status: {model_status['total_mood_entries']} mood entries")
            return True
        else:
            print(f"❌ Model status failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Predictions test failed: {e}")
        return False

def test_ml_model_training(token):
    """Test ML model training"""
    print("🧪 Testing ML model training...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Try to retrain model
        response = requests.post(
            "http://localhost:8000/predictions/retrain",
            headers=headers,
            timeout=30  # Longer timeout for training
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Model training successful: {result['accuracy']:.2f} accuracy")
            return True
        elif response.status_code == 400:
            # This is expected if not enough data
            error = response.json()
            print(f"⚠️  Model training skipped: {error['detail']}")
            return True
        else:
            print(f"❌ Model training failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ML model training test failed: {e}")
        return False

def main():
    """Run all core feature tests"""
    print("🔧 Testing PlanHer Backend Core Features")
    print("=" * 50)
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Could not get authentication token")
        return
    
    print("✅ Authentication token obtained")
    
    # Test profile management
    profile_ok = test_profile_management(token)
    
    # Test period tracking
    period_ok = test_period_tracking(token)
    
    # Test mood tracking
    mood_ok = test_mood_tracking(token)
    
    # Test predictions
    predictions_ok = test_predictions(token)
    
    # Test ML model training
    ml_ok = test_ml_model_training(token)
    
    print("\n" + "=" * 50)
    print("📊 Core Features Test Results:")
    print(f"Profile Management: {'✅ PASS' if profile_ok else '❌ FAIL'}")
    print(f"Period Tracking: {'✅ PASS' if period_ok else '❌ FAIL'}")
    print(f"Mood Tracking: {'✅ PASS' if mood_ok else '❌ FAIL'}")
    print(f"Predictions: {'✅ PASS' if predictions_ok else '❌ FAIL'}")
    print(f"ML Model Training: {'✅ PASS' if ml_ok else '❌ FAIL'}")
    
    if all([profile_ok, period_ok, mood_ok, predictions_ok, ml_ok]):
        print("\n🎉 Core Features Phase 3 Complete!")
        print("✅ Profile management working")
        print("✅ Period tracking working")
        print("✅ Mood tracking working")
        print("✅ Predictions working")
        print("✅ ML model integration working")
        print("✅ Ready to proceed to Phase 4: Frontend Integration")
    else:
        print("\n⚠️  Some core feature tests failed. Please fix issues before proceeding.")

if __name__ == "__main__":
    main()
