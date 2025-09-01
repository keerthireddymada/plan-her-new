#!/bin/bash

# Quick Database Check Script for PlanHer
# This script provides quick commands to check the SQLite database

DB_FILE="planher.db"

echo "🔍 PlanHer Quick Database Check"
echo "================================"

if [ ! -f "$DB_FILE" ]; then
    echo "❌ Database file not found: $DB_FILE"
    exit 1
fi

echo "📊 Database file: $DB_FILE"
echo "📅 Last modified: $(stat -c %y $DB_FILE)"
echo ""

# Function to run SQLite command
run_sql() {
    echo "🔍 $1"
    echo "----------------------------------------"
    sqlite3 "$DB_FILE" "$2"
    echo ""
}

# Check tables
run_sql "All Tables" ".tables"

# Check users
run_sql "Users Count" "SELECT COUNT(*) as user_count FROM users;"

run_sql "Recent Users" "
SELECT id, email, name, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;"

# Check profiles
run_sql "Profiles Count" "SELECT COUNT(*) as profile_count FROM user_profiles;"

run_sql "Recent Profiles" "
SELECT p.id, u.email, p.height_cm, p.weight_kg, p.cycle_length, p.created_at
FROM user_profiles p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 5;"

# Check periods
run_sql "Periods Count" "SELECT COUNT(*) as period_count FROM periods;"

run_sql "Recent Periods" "
SELECT p.id, u.email, p.start_date, p.end_date
FROM periods p
JOIN users u ON p.user_id = u.id
ORDER BY p.start_date DESC
LIMIT 5;"

# Check moods
run_sql "Moods Count" "SELECT COUNT(*) as mood_count FROM moods;"

run_sql "Recent Moods" "
SELECT m.id, u.email, m.date, m.energy_level, m.day_of_cycle
FROM moods m
JOIN users u ON m.user_id = u.id
ORDER BY m.date DESC
LIMIT 5;"

# Summary
echo "📈 SUMMARY"
echo "----------------------------------------"
sqlite3 "$DB_FILE" "
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM user_profiles) as profiles,
    (SELECT COUNT(*) FROM periods) as periods,
    (SELECT COUNT(*) FROM moods) as moods;"

echo ""
echo "✅ Database check complete!"
