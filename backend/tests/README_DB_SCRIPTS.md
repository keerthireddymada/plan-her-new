# PlanHer Database Scripts

This directory contains utility scripts for inspecting and managing the PlanHer SQLite database.

## Available Scripts

### 1. `check_db.py` - Full Database Inspector
**Usage:** `python3 check_db.py`

Shows a complete overview of all tables in the database including:
- Table schemas
- Sample data (first 10 rows)
- Row counts
- All tables: users, user_profiles, period_records, daily_moods, user_models

### 2. `check_users.py` - User & Profile Data Checker
**Usage:** `python3 check_users.py`

Focuses specifically on user-related data:
- User accounts with details
- User profiles with health metrics
- Period records
- Mood records
- Summary statistics

### 3. `add_test_data.py` - Test Data Generator
**Usage:** `python3 add_test_data.py`

Adds sample data for testing:
- 6 months of period records
- 30 days of mood records
- Uses the first user in the database

### 4. `quick_db_check.sh` - Quick Shell Script
**Usage:** `./quick_db_check.sh`

**Note:** Requires SQLite3 command line tool to be installed.

Provides quick database checks using SQLite commands.

## Current Database Status

Based on the latest check:

### Tables Found:
- ✅ `users` - User accounts
- ✅ `user_profiles` - User health profiles  
- ✅ `period_records` - Period tracking data
- ✅ `daily_moods` - Daily mood tracking
- ✅ `user_models` - ML models per user

### Current Data:
- **Users:** 1 (test@example.com)
- **Profiles:** 1 (complete profile for test user)
- **Periods:** 0 (no period data yet)
- **Moods:** 0 (no mood data yet)
- **Models:** 0 (no ML models yet)

## Database Schema

### Users Table
```sql
- id (INTEGER, PRIMARY KEY)
- email (VARCHAR(255), UNIQUE)
- password_hash (VARCHAR(255))
- name (VARCHAR(255))
- is_active (BOOLEAN)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### User Profiles Table
```sql
- id (INTEGER, PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY)
- height_cm (INTEGER)
- weight_kg (NUMERIC(5, 2))
- cycle_length (INTEGER)
- luteal_length (INTEGER)
- menses_length (INTEGER)
- unusual_bleeding (BOOLEAN)
- number_of_peak (INTEGER)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### Period Records Table
```sql
- id (INTEGER, PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY)
- start_date (DATE)
- end_date (DATE)
- created_at (DATETIME)
```

### Daily Moods Table
```sql
- id (INTEGER, PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY)
- date (DATE)
- day_of_cycle (INTEGER)
- energy_level (INTEGER)
- notes (TEXT)
- created_at (DATETIME)
```

### User Models Table
```sql
- id (INTEGER, PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY)
- model_data (BLOB)
- accuracy_score (NUMERIC(5, 4))
- model_version (VARCHAR(50))
- created_at (DATETIME)
```

## Quick Commands

```bash
# Check all database contents
python3 check_db.py

# Check only user data
python3 check_users.py

# Add test data
python3 add_test_data.py

# Quick check (if sqlite3 is installed)
./quick_db_check.sh
```

## Notes

- The database file is `planher.db` in the backend directory
- All scripts use relative paths to find the database
- Test data is added to the first user found in the database
- The database uses SQLite3 format
