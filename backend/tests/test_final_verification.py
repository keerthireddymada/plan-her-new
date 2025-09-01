#!/usr/bin/env python3
"""
Final verification test for PlanHer backend core features
"""

import requests
import json
from datetime import date, datetime, timedelta
import uuid

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

def test_complete_workflow(token):
    """Test complete workflow with unique data"""
    print("🧪 Testing complete workflow...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Generate unique test data
    unique_id = str(uuid.uuid4())[:8]
    today = date.today()
    
    try:
        # 1. Update profile with unique data
        profile_data = {
            "height_cm": 160 + int(unique_id, 16) % 20,
            "weight_kg": 55.0 + (int(unique_id, 16) % 10),
            "cycle_length": 28 + (int(unique_id, 16) % 4),
            "luteal_length": 12 + (int(unique_id, 16) % 4),
            "menses_length": 4 + (int(unique_id, 16) % 3),
            "unusual_bleeding": bool(int(unique_id, 16) % 2),
            "number_of_peak": 2 + (int(unique_id, 16) % 2)
        }
        
        response = requests.put(
            "http://localhost:8000/profiles/me",
            json=profile_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Profile update failed: {response.status_code}")
            return False
        
        print("✅ Profile updated successfully")
        
        # 2. Create unique period record
        period_data = {
            "start_date": (today - timedelta(days=30)).isoformat(),
            "end_date": (today - timedelta(days=25)).isoformat()
        }
        
        response = requests.post(
            "http://localhost:8000/periods/",
            json=period_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code != 201:
            print(f"❌ Period creation failed: {response.status_code}")
            return False
        
        print("✅ Period record created successfully")
        
        # 3. Create unique mood entries
        mood_entries = [
            {"date": (today - timedelta(days=10)).isoformat(), "energy_level": 2, "notes": f"Test mood {unique_id} 1"},
            {"date": (today - timedelta(days=9)).isoformat(), "energy_level": 1, "notes": f"Test mood {unique_id} 2"},
            {"date": (today - timedelta(days=8)).isoformat(), "energy_level": 0, "notes": f"Test mood {unique_id} 3"},
            {"date": (today - timedelta(days=7)).isoformat(), "energy_level": 1, "notes": f"Test mood {unique_id} 4"},
            {"date": (today - timedelta(days=6)).isoformat(), "energy_level": 2, "notes": f"Test mood {unique_id} 5"},
            {"date": (today - timedelta(days=5)).isoformat(), "energy_level": 1, "notes": f"Test mood {unique_id} 6"}
        ]
        
        for mood_data in mood_entries:
            response = requests.post(
                "http://localhost:8000/moods/",
                json=mood_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code != 201:
                print(f"❌ Mood creation failed: {response.status_code}")
                return False
        
        print("✅ Mood entries created successfully")
        
        # 4. Test predictions
        response = requests.get(
            "http://localhost:8000/predictions/current",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            prediction = response.json()
            print(f"✅ Current prediction: {prediction['predicted_mood']} mood")
        else:
            print(f"❌ Current prediction failed: {response.status_code}")
            return False
        
        # 5. Test ML model training
        response = requests.post(
            "http://localhost:8000/predictions/retrain",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Model training successful: {result['accuracy']:.2f} accuracy")
        else:
            print(f"❌ Model training failed: {response.status_code}")
            return False
        
        # 6. Test predictions again with trained model
        response = requests.get(
            "http://localhost:8000/predictions/current",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            prediction = response.json()
            print(f"✅ Prediction with trained model: {prediction['predicted_energy_level']} mood")
        else:
            print(f"❌ Prediction with trained model failed: {response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Complete workflow test failed: {e}")
        return False

def main():
    """Run final verification test"""
    print("🎯 Final Verification Test - PlanHer Backend")
    print("=" * 50)
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Could not get authentication token")
        return
    
    print("✅ Authentication token obtained")
    
    # Test complete workflow
    success = test_complete_workflow(token)
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 FINAL VERIFICATION: ALL FEATURES WORKING!")
        print("✅ Profile management working")
        print("✅ Period tracking working")
        print("✅ Mood tracking working")
        print("✅ ML model training working")
        print("✅ Predictions working")
        print("✅ Complete workflow verified")
        print("\n🚀 Ready for Phase 4: Frontend Integration!")
    else:
        print("⚠️  Some features still need attention")

if __name__ == "__main__":
    main()
