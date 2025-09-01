#!/usr/bin/env python3
"""
User and Profile Data Checker for PlanHer
This script specifically checks user and profile data
"""

import sqlite3
import os
from datetime import datetime

def connect_db():
    """Connect to the SQLite database"""
    db_path = os.path.join(os.path.dirname(__file__), 'planher.db')
    return sqlite3.connect(db_path)

def check_users(cursor):
    """Check user data"""
    print("👥 USERS TABLE")
    print("=" * 40)
    
    cursor.execute("""
        SELECT id, email, name, is_active, created_at, updated_at 
        FROM users 
        ORDER BY created_at DESC
    """)
    
    users = cursor.fetchall()
    if not users:
        print("No users found")
        return
    
    print(f"{'ID':<3} | {'Email':<25} | {'Name':<15} | {'Active':<6} | {'Created At':<20}")
    print("-" * 90)
    
    for user in users:
        id, email, name, is_active, created_at, updated_at = user
        active_str = "Yes" if is_active else "No"
        created_str = created_at[:19] if created_at else "N/A"
        print(f"{id:<3} | {email:<25} | {name:<15} | {active_str:<6} | {created_str:<20}")

def check_profiles(cursor):
    """Check profile data"""
    print("\n👤 PROFILES TABLE")
    print("=" * 40)
    
    cursor.execute("""
        SELECT p.id, p.user_id, u.email, p.height_cm, p.weight_kg, 
               p.cycle_length, p.luteal_length, p.menses_length, 
               p.unusual_bleeding, p.number_of_peak, p.created_at
        FROM user_profiles p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    """)
    
    profiles = cursor.fetchall()
    if not profiles:
        print("No profiles found")
        return
    
    print(f"{'ID':<3} | {'User ID':<7} | {'Email':<25} | {'Height':<6} | {'Weight':<6} | {'Cycle':<5} | {'Luteal':<6} | {'Menses':<6} | {'Bleeding':<8} | {'Peaks':<5}")
    print("-" * 120)
    
    for profile in profiles:
        id, user_id, email, height, weight, cycle, luteal, menses, bleeding, peaks, created_at = profile
        bleeding_str = "Yes" if bleeding else "No"
        print(f"{id:<3} | {user_id:<7} | {email:<25} | {height:<6} | {weight:<6} | {cycle:<5} | {luteal:<6} | {menses:<6} | {bleeding_str:<8} | {peaks:<5}")

def check_periods(cursor):
    """Check period data"""
    print("\n🩸 PERIODS TABLE")
    print("=" * 40)
    
    cursor.execute("""
        SELECT p.id, p.user_id, u.email, p.start_date, p.end_date, p.created_at
        FROM period_records p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.start_date DESC
        LIMIT 10
    """)
    
    periods = cursor.fetchall()
    if not periods:
        print("No periods found")
        return
    
    print(f"{'ID':<3} | {'User ID':<7} | {'Email':<25} | {'Start Date':<12} | {'End Date':<12} | {'Created':<20}")
    print("-" * 90)
    
    for period in periods:
        id, user_id, email, start_date, end_date, created_at = period
        end_str = end_date if end_date else "Ongoing"
        created_str = created_at[:19] if created_at else "N/A"
        print(f"{id:<3} | {user_id:<7} | {email:<25} | {start_date:<12} | {end_str:<12} | {created_str:<20}")

def check_moods(cursor):
    """Check mood data"""
    print("\n😊 MOODS TABLE")
    print("=" * 40)
    
    cursor.execute("""
        SELECT m.id, m.user_id, u.email, m.date, m.energy_level, m.day_of_cycle, m.created_at
        FROM daily_moods m
        JOIN users u ON m.user_id = u.id
        ORDER BY m.date DESC
        LIMIT 10
    """)
    
    moods = cursor.fetchall()
    if not moods:
        print("No moods found")
        return
    
    print(f"{'ID':<3} | {'User ID':<7} | {'Email':<25} | {'Date':<12} | {'Energy':<8} | {'Cycle Day':<9} | {'Created':<20}")
    print("-" * 100)
    
    for mood in moods:
        id, user_id, email, date, energy, cycle_day, created_at = mood
        created_str = created_at[:19] if created_at else "N/A"
        cycle_str = str(cycle_day) if cycle_day else "N/A"
        print(f"{id:<3} | {user_id:<7} | {email:<25} | {date:<12} | {energy:<8} | {cycle_str:<9} | {created_str:<20}")

def main():
    """Main function"""
    print("🔍 PlanHer User & Profile Data Checker")
    print("=" * 50)
    
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        # Check each table
        check_users(cursor)
        check_profiles(cursor)
        check_periods(cursor)
        check_moods(cursor)
        
        # Summary
        print("\n📊 SUMMARY")
        print("=" * 40)
        
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM user_profiles")
        profile_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM period_records")
        period_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM daily_moods")
        mood_count = cursor.fetchone()[0]
        
        print(f"Total Users: {user_count}")
        print(f"Total Profiles: {profile_count}")
        print(f"Total Periods: {period_count}")
        print(f"Total Moods: {mood_count}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
