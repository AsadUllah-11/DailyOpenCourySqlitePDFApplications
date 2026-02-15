# backend/core/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('STAFF', 'Staff'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STAFF')
    phone = models.CharField(max_length=15, blank=True)
    police_station = models.CharField(max_length=100, blank=True)
    division = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"


class OpenCourtApplication(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('HEARD', 'Heard'),
        ('REFERRED', 'Referred to Legal Assistance'),
        ('CLOSED', 'Closed'),
    ]
    
    FEEDBACK_CHOICES = [
        ('POSITIVE', 'Positive'),
        ('NEGATIVE', 'Negative'),
        ('PENDING', 'Pending'),
    ]
    
    sr_no = models.IntegerField(unique=True)
    dairy_no = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    contact = models.CharField(max_length=15)
    marked_to = models.CharField(max_length=200, blank=True)
    date = models.DateField(null=True, blank=True)
    marked_by = models.CharField(max_length=200, blank=True)
    timeline = models.CharField(max_length=100, blank=True)
    police_station = models.CharField(max_length=100)
    division = models.CharField(max_length=100)
    category = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    days = models.IntegerField(null=True, blank=True)
    feedback = models.CharField(max_length=20, choices=FEEDBACK_CHOICES, default='PENDING')
    dairy_ps = models.CharField(max_length=100, blank=True)
    
    remarks = models.TextField(blank=True)
    video_response = models.FileField(upload_to='video_responses/', null=True, blank=True)
    supporting_documents = models.FileField(upload_to='documents/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_applications')
    
    class Meta:
        ordering = ['-created_at']
        # ⚡ DATABASE INDEXES FOR SUPER FAST QUERIES
        indexes = [
            models.Index(fields=['police_station'], name='idx_police_station'),
            models.Index(fields=['division'], name='idx_division'),
            models.Index(fields=['category'], name='idx_category'),
            models.Index(fields=['status'], name='idx_status'),
            models.Index(fields=['feedback'], name='idx_feedback'),
            models.Index(fields=['date'], name='idx_date'),
            models.Index(fields=['created_at'], name='idx_created_at'),
            models.Index(fields=['sr_no'], name='idx_sr_no'),
            models.Index(fields=['dairy_no'], name='idx_dairy_no'),
            models.Index(fields=['name'], name='idx_name'),
            # Composite indexes for common filter combinations
            models.Index(fields=['police_station', 'status'], name='idx_ps_status'),
            models.Index(fields=['status', 'feedback'], name='idx_status_feedback'),
        ]
    
    def __str__(self):
        return f"{self.dairy_no} - {self.name}"

class VideoFeedback(models.Model):
    FEEDBACK_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('LIKE', 'Approved'),
        ('DISLIKE', 'Rejected'),
    ]
    
    user_name = models.CharField(max_length=200)  # Random name for now
    video_file = models.FileField(upload_to='video_feedback/')
    title = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    submitted_date = models.DateTimeField(auto_now_add=True)
    
    # Admin feedback
    admin_feedback = models.CharField(max_length=20, choices=FEEDBACK_CHOICES, default='PENDING')
    admin_remarks = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='video_reviews')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Video metadata
    duration = models.IntegerField(null=True, blank=True, help_text='Duration in seconds')
    file_size = models.BigIntegerField(null=True, blank=True, help_text='File size in bytes')
    thumbnail = models.ImageField(upload_to='video_thumbnails/', null=True, blank=True)
    
    class Meta:
        ordering = ['-submitted_date']
        verbose_name = 'Video Feedback'
        verbose_name_plural = 'Video Feedbacks'
    
    def __str__(self):
        return f"{self.user_name} - {self.title or 'Video Feedback'}"
    
    @property
    def file_size_mb(self):
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return None
    



# Add this new model at the end of the file

class PDFApplication(models.Model):
    """PDF Applications uploaded by admin"""
    
    # Link to existing application
    application = models.ForeignKey(
        OpenCourtApplication, 
        on_delete=models.CASCADE, 
        related_name='pdf_documents'
    )
    
    # PDF file
    pdf_file = models.FileField(upload_to='pdf_applications/')
    
    # Metadata
    file_name = models.CharField(max_length=300)
    file_size = models.BigIntegerField(help_text='File size in bytes')
    uploaded_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='uploaded_pdfs'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Optional description
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'PDF Application'
        verbose_name_plural = 'PDF Applications'
    
    def __str__(self):
        return f"{self.application.dairy_no} - {self.file_name}"
    
    @property
    def file_size_mb(self):
        """Return file size in MB"""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return None