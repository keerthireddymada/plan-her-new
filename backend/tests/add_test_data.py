#!/usr/bin/env python3
"""
Add Test Data Script for PlanHer
This script adds some test data to the database for testing purposes
"""

import sqlite3
import os
from datetime import datetime, date, timedelta
import random

def connect_db():
    """Connect to the SQLite database"""
    db_path = os.path.join(os.path.dirname(__file__), 'planher.db')
    return sqlite3.connect(db_path)

def add_test_periods(cursor, user_id):
    """Add some test period data"""
    print("Adding test periods...")
    
    # Add periods for the last 6 months
    start_date = date.today() - timedelta(days=180)
    
    for i in range(6):
        period_start = start_date + timedelta(days=i * 28)
        period_end = period_start + timedelta(days=5)
        
        cursor.execute("""
            INSERT INTO period_records (user_id, start_date, end_date, created_at)
            VALUES (?, ?, ?, ?)
        """, (user_id, period_start, period_end, datetime.now()))
    
    print(f"✅ Added 6 test periods for user {user_id}")

def add_test_moods(cursor, user_id):
    """Add some test mood data"""
    print("Adding test moods...")
    
    # Add moods for the last 30 days
    start_date = date.today() - timedelta(days=30)
    
    energy_levels = ['low', 'medium', 'high']
    
    for i in range(30):
        mood_date = start_date + timedelta(days=i)
        energy_level = random.choice(energy_levels)
        day_of_cycle = (i % 28) + 1  # Simulate cycle days
        
        cursor.execute("""
            INSERT INTO daily_moods (user_id, date, day_of_cycle, energy_level, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, mood_date, day_of_cycle, energy_level, f"Test mood for day {i+1}", datetime.now()))
    
    print(f"✅ Added 30 test moods for user {user_id}")

def main():
    """Main function"""
    print("🧪 PlanHer Test Data Generator")
    print("=" * 40)
    
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        # Check if we have any users
        cursor.execute("SELECT id, email FROM users LIMIT 1")
        user = cursor.fetchone()
        
        if not user:
            print("❌ No users found. Please create a user first.")
            return
        
        user_id, email = user
        print(f"📝 Adding test data for user: {email} (ID: {user_id})")
        print()
        
        # Add test periods
        add_test_periods(cursor, user_id)
        
        # Add test moods
        add_test_moods(cursor, user_id)
        
        # Commit changes
        conn.commit()
        
        print()
        print("📊 Updated Database Summary:")
        print("-" * 30)
        
        cursor.execute("SELECT COUNT(*) FROM period_records")
        period_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM daily_moods")
        mood_count = cursor.fetchone()[0]
        
        print(f"Total Periods: {period_count}")
        print(f"Total Moods: {mood_count}")
        
        conn.close()
        print()
        print("✅ Test data added successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
