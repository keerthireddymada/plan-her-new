#!/usr/bin/env python3
"""
Test script to verify PlanHer backend authentication system
"""

import requests
import json
from app.database import create_tables, get_db
from app.models import User
from app.core.security import get_password_hash, verify_password, create_access_token

def test_password_hashing():
    """Test password hashing and verification"""
    print("🧪 Testing password hashing...")
    try:
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        # Test verification
        assert verify_password(password, hashed) == True
        assert verify_password("wrongpassword", hashed) == False
        
        print("✅ Password hashing works correctly")
        return True
    except Exception as e:
        print(f"❌ Password hashing test failed: {e}")
        return False

def test_jwt_token_creation():
    """Test JWT token creation and verification"""
    print("🧪 Testing JWT token creation...")
    try:
        from app.core.security import create_access_token, verify_token
        
        # Test token creation
        token_data = {"sub": "test@example.com", "user_id": 1}
        token = create_access_token(token_data)
        
        # Test token verification
        verified_data = verify_token(token)
        assert verified_data is not None
        assert verified_data.email == "test@example.com"
        assert verified_data.user_id == 1
        
        print("✅ JWT token creation works correctly")
        return True
    except Exception as e:
        print(f"❌ JWT token test failed: {e}")
        return False

def test_user_registration():
    """Test user registration endpoint"""
    print("🧪 Testing user registration...")
    try:
        # Test data
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "name": "Test User"
        }
        
        response = requests.post(
            "http://localhost:8000/auth/register",
            json=user_data,
            timeout=10
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ User registration successful: {data['email']}")
            return True, data
        else:
            print(f"❌ User registration failed: {response.status_code} - {response.text}")
            return False, None
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure it's running on port 8000")
        return False, None
    except Exception as e:
        print(f"❌ User registration test failed: {e}")
        return False, None

def test_user_login():
    """Test user login endpoint"""
    print("🧪 Testing user login...")
    try:
        # Test data
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
            print(f"✅ User login successful: {data['token_type']}")
            return True, data['access_token']
        else:
            print(f"❌ User login failed: {response.status_code} - {response.text}")
            return False, None
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure it's running on port 8000")
        return False, None
    except Exception as e:
        print(f"❌ User login test failed: {e}")
        return False, None

def test_protected_endpoint(access_token):
    """Test accessing a protected endpoint"""
    print("🧪 Testing protected endpoint...")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = requests.get(
            "http://localhost:8000/auth/me",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Protected endpoint accessible: {data['email']}")
            return True
        else:
            print(f"❌ Protected endpoint failed: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure it's running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Protected endpoint test failed: {e}")
        return False

def test_invalid_token():
    """Test accessing protected endpoint with invalid token"""
    print("🧪 Testing invalid token...")
    try:
        headers = {"Authorization": "Bearer invalid_token"}
        
        response = requests.get(
            "http://localhost:8000/auth/me",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 401:
            print("✅ Invalid token correctly rejected")
            return True
        else:
            print(f"❌ Invalid token not rejected: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure it's running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Invalid token test failed: {e}")
        return False

def main():
    """Run all authentication tests"""
    print("🔐 Testing PlanHer Backend Authentication")
    print("=" * 50)
    
    # Test password hashing
    hashing_ok = test_password_hashing()
    
    # Test JWT token creation
    jwt_ok = test_jwt_token_creation()
    
    # Test user registration
    registration_ok, user_data = test_user_registration()
    
    # Test user login
    login_ok, access_token = test_user_login()
    
    # Test protected endpoint
    protected_ok = False
    if login_ok and access_token:
        protected_ok = test_protected_endpoint(access_token)
    
    # Test invalid token
    invalid_token_ok = test_invalid_token()
    
    print("\n" + "=" * 50)
    print("📊 Authentication Test Results:")
    print(f"Password Hashing: {'✅ PASS' if hashing_ok else '❌ FAIL'}")
    print(f"JWT Token Creation: {'✅ PASS' if jwt_ok else '❌ FAIL'}")
    print(f"User Registration: {'✅ PASS' if registration_ok else '❌ FAIL'}")
    print(f"User Login: {'✅ PASS' if login_ok else '❌ FAIL'}")
    print(f"Protected Endpoint: {'✅ PASS' if protected_ok else '❌ FAIL'}")
    print(f"Invalid Token Rejection: {'✅ PASS' if invalid_token_ok else '❌ FAIL'}")
    
    if all([hashing_ok, jwt_ok, registration_ok, login_ok, protected_ok, invalid_token_ok]):
        print("\n🎉 Authentication Phase 2 Complete!")
        print("✅ JWT authentication system is working correctly")
        print("✅ Password hashing and verification working")
        print("✅ User registration and login working")
        print("✅ Protected endpoints working")
        print("✅ Ready to proceed to Phase 3: Core Features")
    else:
        print("\n⚠️  Some authentication tests failed. Please fix issues before proceeding.")

if __name__ == "__main__":
    main()
