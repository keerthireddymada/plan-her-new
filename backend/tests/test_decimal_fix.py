#!/usr/bin/env python3
"""
Test to verify decimal conversion fix
"""

from decimal import Decimal
from app.core.ml_model import compute_bmi

def test_decimal_conversion():
    """Test that decimal conversion works"""
    print("🧪 Testing decimal conversion...")
    
    # Test with regular floats
    bmi1 = compute_bmi(165, 60.0)
    print(f"✅ Regular float BMI: {bmi1}")
    
    # Test with Decimal objects
    bmi2 = compute_bmi(165, Decimal('60.0'))
    print(f"✅ Decimal BMI: {bmi2}")
    
    # Test with both Decimal
    bmi3 = compute_bmi(Decimal('165'), Decimal('60.0'))
    print(f"✅ Both Decimal BMI: {bmi3}")
    
    # Verify they're all the same
    if abs(bmi1 - bmi2) < 0.001 and abs(bmi1 - bmi3) < 0.001:
        print("✅ All BMI calculations match!")
        return True
    else:
        print("❌ BMI calculations don't match!")
        return False

if __name__ == "__main__":
    test_decimal_conversion()
