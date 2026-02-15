from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from . models import User, OpenCourtApplication
# Add this import at the top
from .models import User, OpenCourtApplication, VideoFeedback, PDFApplication

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'police_station', 'division']
    list_filter = ['role', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'police_station', 'division')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'police_station', 'division')}),
    )

@admin.register(OpenCourtApplication)
class OpenCourtApplicationAdmin(admin.ModelAdmin):
    list_display = ['sr_no', 'dairy_no', 'name', 'contact', 'police_station', 'status', 'feedback']
    list_filter = ['status', 'feedback', 'police_station', 'division']
    search_fields = ['name', 'dairy_no', 'contact']
    list_per_page = 50


@admin.register(PDFApplication)
class PDFApplicationAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_dairy_no', 'file_name', 'file_size_mb', 'uploaded_by', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['file_name', 'application__dairy_no', 'application__name']
    readonly_fields = ['uploaded_at', 'file_size', 'file_size_mb']
    
    def get_dairy_no(self, obj):
        return obj.application.dairy_no
    get_dairy_no.short_description = 'Dairy No'