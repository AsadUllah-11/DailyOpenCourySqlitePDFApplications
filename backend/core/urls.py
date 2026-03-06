from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'applications', views.OpenCourtApplicationViewSet, basename='application')
router.register(r'video-feedback', views.VideoFeedbackViewSet, basename='video-feedback')
router.register(r'pdf-applications', views.PDFApplicationViewSet, basename='pdf-application')

urlpatterns = [
    path('', include(router.urls)),
    
    # ==========================================
    # AUTHENTICATION ENDPOINTS
    # ==========================================
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/user/', views.current_user, name='current_user'),
    
    # ==========================================
    # STAFF MANAGEMENT ENDPOINTS
    # ==========================================
    path('staff/', views.staff_management, name='staff_management'),
    path('staff/<int:user_id>/', views.staff_detail, name='staff_detail'),
    
    # ==========================================
    # APPLICATION ENDPOINTS
    # ==========================================
    path('upload-excel/', views.upload_excel, name='upload_excel'),
    path('export-applications/', views.export_applications, name='export_applications'),
    
    # ⭐ NEW: Check if dairy number exists
    path('check-dairy-number/', views.check_dairy_number, name='check_dairy_number'),
    
    # ==========================================
    # STATISTICS ENDPOINTS
    # ==========================================
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    path('video-feedback-stats/', views.video_feedback_stats, name='video_feedback_stats'),
    path('pdf-application-stats/', views.pdf_application_stats, name='pdf_application_stats'),
    
    # ==========================================
    # METADATA ENDPOINTS
    # ==========================================
    path('police-stations/', views.police_stations, name='police_stations'),
    path('categories/', views.categories, name='categories'),
    path('divisions/', views.divisions_list, name='divisions'),
    
    # ==========================================
    # PDF APPLICATION ENDPOINTS
    # ==========================================
    path('verify-dairy-number/', views.verify_dairy_number, name='verify_dairy_number'),
]