import os
import django
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Now import models
from core.models import OpenCourtApplication
from django.db.models import Count

def main():
    # Define stipulated time options
    stipulated_times = [
        '7 days',
        '15 days', 
        '20 days',
        '30 days',
        '45 days',
        '60 days',
        '90 days'
    ]

    # Get all applications
    applications = OpenCourtApplication.objects.all()[:1000]
    
    print(f"📊 Found {applications.count()} applications to update...")

    # Update each application
    updated_count = 0
    for app in applications:
        app.stipulated_time = random.choice(stipulated_times)
        app.save(update_fields=['stipulated_time'])
        updated_count += 1
        
        # Show progress every 100 records
        if updated_count % 100 == 0:
            print(f"  ✓ Updated {updated_count} records...")

    print(f"\n✅ Successfully updated {updated_count} applications!")

    # Show distribution
    distribution = OpenCourtApplication.objects.exclude(
        stipulated_time=''
    ).values('stipulated_time').annotate(count=Count('id')).order_by('-count')

    print("\n📊 Distribution:")
    for item in distribution:
        print(f"  {item['stipulated_time']}: {item['count']} records")

if __name__ == '__main__':
    main()