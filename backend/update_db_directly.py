# backend/update_db_directly.py

import sqlite3
import random

def update_applications(limit=1000):
    """
    Update application status and feedback with realistic distribution
    Using EXACT values from your system:
    - Status: Pending, Heard, Referred, Closed
    - Feedback: Positive, Negative, Pending
    """
    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = sqlite3.connect('db.sqlite3')
        cursor = conn.cursor()
        
        print(f"🔍 Fetching {limit} pending applications...")
        
        # Get pending applications
        cursor.execute("""
            SELECT id FROM core_opencourtapplication 
            WHERE status = 'PENDING' 
            LIMIT ?
        """, (limit,))
        
        pending_ids = [row[0] for row in cursor.fetchall()]
        
        if not pending_ids:
            print("⚠️  No pending applications found!")
            conn.close()
            return
        
        print(f"📊 Found {len(pending_ids)} pending applications")
        print("🔄 Updating records...\n")
        
        # ✅ STATUS DISTRIBUTION - Using YOUR exact values
        statuses = (
            ['PENDING'] * 15 +    # 15% - Keep some pending
            ['HEARD'] * 45 +      # 45% - Most cases heard
            ['REFERRED'] * 25 +   # 25% - Referred to other departments
            ['CLOSED'] * 15       # 15% - Closed cases
        )
        
        # ✅ FEEDBACK DISTRIBUTION - Using YOUR exact values
        feedbacks = (
            ['POSITIVE'] * 50 +   # 50% - Positive feedback
            ['NEGATIVE'] * 30 +   # 30% - Negative feedback
            ['PENDING'] * 20      # 20% - Pending feedback
        )
        
        updated_count = 0
        
        # Update each application
        for app_id in pending_ids:
            status = random.choice(statuses)
            feedback = random.choice(feedbacks)
            
            # Assign days based on status
            if status == 'HEARD':
                days = random.randint(1, 30)
            elif status == 'REFERRED':
                days = random.randint(5, 45)
            elif status == 'CLOSED':
                days = random.randint(30, 90)
            elif status == 'PENDING':
                days = None  # Pending cases have no days yet
            else:
                days = random.randint(1, 60)
            
            # Update the record
            cursor.execute("""
                UPDATE core_opencourtapplication 
                SET status = ?, feedback = ?, days = ?
                WHERE id = ?
            """, (status, feedback, days, app_id))
            
            updated_count += 1
            
            # Show progress every 100 records
            if updated_count % 100 == 0:
                print(f"  ✓ Updated {updated_count}/{len(pending_ids)} records...")
        
        # Commit all changes
        conn.commit()
        
        print(f"\n✅ Successfully updated {updated_count} applications!")
        
        # Show statistics
        print("\n" + "="*50)
        print("📊 CURRENT STATUS DISTRIBUTION:")
        print("="*50)
        cursor.execute("""
            SELECT status, COUNT(*) as count
            FROM core_opencourtapplication 
            GROUP BY status
            ORDER BY count DESC
        """)
        
        total = 0
        status_data = []
        for row in cursor.fetchall():
            status_data.append(row)
            total += row[1]
        
        for row in status_data:
            percentage = (row[1] / total * 100) if total > 0 else 0
            print(f"  {row[0]:15s}: {row[1]:5d} records ({percentage:.1f}%)")
        
        print("\n" + "="*50)
        print("📈 CURRENT FEEDBACK DISTRIBUTION:")
        print("="*50)
        cursor.execute("""
            SELECT feedback, COUNT(*) as count
            FROM core_opencourtapplication 
            GROUP BY feedback
            ORDER BY count DESC
        """)
        
        total = 0
        feedback_data = []
        for row in cursor.fetchall():
            feedback_data.append(row)
            total += row[1]
        
        for row in feedback_data:
            percentage = (row[1] / total * 100) if total > 0 else 0
            print(f"  {row[0]:15s}: {row[1]:5d} records ({percentage:.1f}%)")
        
        print("\n" + "="*50)
        
        # Close connection
        conn.close()
        print("\n🎉 Done! Your graphs should look great now!")
        print("💡 Tip: Refresh your dashboard to see the updated charts!")
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

def check_database_values():
    """
    Check what status and feedback values currently exist in the database
    """
    try:
        conn = sqlite3.connect('db.sqlite3')
        cursor = conn.cursor()
        
        print("\n🔍 Checking current database values...\n")
        
        print("Current Status Values:")
        cursor.execute("""
            SELECT DISTINCT status 
            FROM core_opencourtapplication 
            ORDER BY status
        """)
        for row in cursor.fetchall():
            print(f"  - {row[0]}")
        
        print("\nCurrent Feedback Values:")
        cursor.execute("""
            SELECT DISTINCT feedback 
            FROM core_opencourtapplication 
            ORDER BY feedback
        """)
        for row in cursor.fetchall():
            print(f"  - {row[0]}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    print("="*50)
    print("  APPLICATION STATUS & FEEDBACK UPDATER")
    print("  Using: Pending, Heard, Referred, Closed")
    print("="*50)
    print()
    
    # First, check what values are in the database
    check_database_values()
    
    print("\n" + "="*50)
    input("Press Enter to continue with update...")
    print()
    
    # Update 1000 applications
    update_applications(1000)
    
    # To update more records, change the number:
    # update_applications(2000)  # Update 2000 records
    # update_applications(5000)  # Update 5000 records
    
    print("\n✨ Press Enter to exit...")
    input()