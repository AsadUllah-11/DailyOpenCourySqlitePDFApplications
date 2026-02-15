from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import OpenCourtApplication, VideoFeedback
from . models import OpenCourtApplication
# Add this import at the top if not already there
from .models import OpenCourtApplication, VideoFeedback, PDFApplication
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'police_station', 'division', 'first_name', 'last_name']
        read_only_fields = ['id']


class OpenCourtApplicationSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = OpenCourtApplication
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']


class ApplicationStatsSerializer(serializers. Serializer):
    total_applications = serializers.IntegerField()
    pending = serializers.IntegerField()
    heard = serializers.IntegerField()
    referred = serializers.IntegerField()
    closed = serializers.IntegerField()
    positive_feedback = serializers.IntegerField()
    negative_feedback = serializers.IntegerField()


class CategoryStatsSerializer(serializers.Serializer):
    category = serializers.CharField()
    count = serializers.IntegerField()


class PoliceStationStatsSerializer(serializers.Serializer):
    police_station = serializers.CharField()
    count = serializers.IntegerField()
    pending = serializers.IntegerField()
    heard = serializers.IntegerField()

class VideoFeedbackSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.ReadOnlyField()
    reviewed_by_name = serializers.CharField(source='reviewed_by.username', read_only=True)
    
    class Meta:
        model = VideoFeedback
        fields = [
            'id', 'user_name', 'video_file', 'title', 'description',
            'submitted_date', 'admin_feedback', 'admin_remarks',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at',
            'duration', 'file_size', 'file_size_mb', 'thumbnail'
        ]
        read_only_fields = ['submitted_date', 'reviewed_by', 'reviewed_at']






# Add this new serializer at the end of the file

class PDFApplicationSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.ReadOnlyField()
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    # Application details
    dairy_no = serializers.CharField(source='application.dairy_no', read_only=True)
    applicant_name = serializers.CharField(source='application.name', read_only=True)
    police_station = serializers.CharField(source='application.police_station', read_only=True)
    status = serializers.CharField(source='application.status', read_only=True)
    
    class Meta:
        model = PDFApplication
        fields = [
            'id', 'application', 'pdf_file', 'file_name', 'file_size', 
            'file_size_mb', 'uploaded_by', 'uploaded_by_name', 'uploaded_at',
            'description', 'dairy_no', 'applicant_name', 'police_station', 'status'
        ]
        read_only_fields = ['uploaded_at', 'uploaded_by', 'file_size']