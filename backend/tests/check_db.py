#!/usr/bin/env python3
"""
Database inspection script for PlanHer
This script helps you check the contents of the SQLite database
"""

import sqlite3
import os
from datetime import datetime

def connect_db():
    """Connect to the SQLite database"""
    db_path = os.path.join(os.path.dirname(__file__), 'planher.db')
    return sqlite3.connect(db_path)

def get_table_names(cursor):
    """Get all table names in the database"""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    return [row[0] for row in cursor.fetchall()]

def get_table_schema(cursor, table_name):
    """Get the schema of a table"""
    cursor.execute(f"PRAGMA table_info({table_name});")
    return cursor.fetchall()

def get_table_data(cursor, table_name, limit=10):
    """Get data from a table"""
    cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit};")
    return cursor.fetchall()

def format_table_data(data, columns):
    """Format table data for display"""
    if not data:
        return "No data found"
    
    # Create header
    header = " | ".join([col[1] for col in columns])
    separator = "-" * len(header)
    
    # Format rows
    rows = []
    for row in data:
        formatted_row = []
        for i, value in enumerate(row):
            if isinstance(value, datetime):
                formatted_row.append(str(value))
            elif value is None:
                formatted_row.append("NULL")
            else:
                formatted_row.append(str(value))
        rows.append(" | ".join(formatted_row))
    
    return f"{header}\n{separator}\n" + "\n".join(rows)

def main():
    """Main function to inspect database"""
    print("🔍 PlanHer Database Inspector")
    print("=" * 50)
    
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        # Get all tables
        tables = get_table_names(cursor)
        print(f"📋 Found {len(tables)} tables: {', '.join(tables)}")
        print()
        
        # Inspect each table
        for table_name in tables:
            print(f"📊 Table: {table_name}")
            print("-" * 30)
            
            # Get schema
            schema = get_table_schema(cursor, table_name)
            print("Schema:")
            for col in schema:
                print(f"  - {col[1]} ({col[2]})")
            print()
            
            # Get data
            data = get_table_data(cursor, table_name)
            print("Data:")
            if data:
                formatted_data = format_table_data(data, schema)
                print(formatted_data)
            else:
                print("  No data found")
            print()
            
            # Count rows
            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            count = cursor.fetchone()[0]
            print(f"Total rows: {count}")
            print("=" * 50)
            print()
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
