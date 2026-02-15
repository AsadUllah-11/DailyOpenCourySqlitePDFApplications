import os
import sys
import django
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import VideoFeedback
import random
from datetime import datetime, timedelta

# Random user names
USER_NAMES = [
    'Unknown', 'Unknown', 'Unknown', 'Unknown',
    'Unknown', 'Unknown', 'Unknown', 'Unknown',
    'Unknown', 'Unknown', 'Unknown', 'Unknown',
    'Unknown', 'Unknown', 'Unknown', 'Unknown'
]

VIDEO_TITLES = [
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback',
    'Feedback'
]

def load_videos_from_folder(folder_path):
    """Load all videos from specified folder"""
    
    print(f"📂 Loading videos from: {folder_path}")
    
    if not os.path.exists(folder_path):
        print(f"❌ Folder not found: {folder_path}")
        return
    
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    video_files = []
    
    for file in os.listdir(folder_path):
        if any(file.lower().endswith(ext) for ext in video_extensions):
            video_files.append(file)
    
    if not video_files:
        print("❌ No video files found in folder")
        return
    
    print(f"✅ Found {len(video_files)} video files")
    
    # Clear existing records (optional)
    VideoFeedback.objects.all().delete()
    print("🗑️ Cleared existing video feedback records")
    
    created_count = 0
    
    for video_file in video_files:
        source_path = os.path.join(folder_path, video_file)
        dest_path = os.path.join('media', 'video_feedback', video_file)
        
        # Copy file if not exists
        if not os.path.exists(dest_path):
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            import shutil
            shutil.copy2(source_path, dest_path)
            print(f"📋 Copied: {video_file}")
        
        # Get file size
        file_size = os.path.getsize(source_path)
        
        # Create random metadata
        user_name = random.choice(USER_NAMES)
        title = random.choice(VIDEO_TITLES)
        description = f"Video feedback submitted by {user_name} regarding their experience at the open court."
        
        # Random submitted date (last 30 days)
        days_ago = random.randint(0, 30)
        submitted_date = datetime.now() - timedelta(days=days_ago)
        
        # Create VideoFeedback record
        video_feedback = VideoFeedback.objects.create(
            user_name=user_name,
            video_file=f'video_feedback/{video_file}',
            title=title,
            description=description,
            file_size=file_size,
            admin_feedback='PENDING'
        )
        
        # Manually set submitted_date
        video_feedback.submitted_date = submitted_date
        video_feedback.save()
        
        created_count += 1
        print(f"✅ Created: {user_name} - {video_file}")
    
    print(f"\n🎉 Successfully loaded {created_count} videos!")

if __name__ == '__main__':
    # Update this path to your videos folder
    VIDEO_FOLDER = r'D:\\seven semester\\FYP\\daily open court\\daily-open-court\\backend\\media\\video_feedback'
    load_videos_from_folder(VIDEO_FOLDER)