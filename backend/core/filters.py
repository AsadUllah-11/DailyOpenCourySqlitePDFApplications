import django_filters
from .models import OpenCourtApplication

class OpenCourtApplicationFilter(django_filters.FilterSet):
    """Custom filters for OpenCourtApplication"""
    
    # Text search filters
    name = django_filters.CharFilter(lookup_expr='icontains')
    dairy_no = django_filters.CharFilter(lookup_expr='icontains')
    contact = django_filters.CharFilter(lookup_expr='icontains')
    
    # Exact match filters
    status = django_filters.CharFilter(lookup_expr='exact')
    feedback = django_filters.CharFilter(lookup_expr='exact')
    police_station = django_filters.CharFilter(lookup_expr='iexact')
    division = django_filters.CharFilter(lookup_expr='iexact')
    category = django_filters.CharFilter(lookup_expr='icontains')
    
    # Date range filters
    from_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    to_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    
    class Meta:
        model = OpenCourtApplication
        fields = [
            'name', 'dairy_no', 'contact', 'status', 'feedback',
            'police_station', 'division', 'category', 'from_date', 'to_date'
        ]