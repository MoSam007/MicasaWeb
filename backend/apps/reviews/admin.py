from django.contrib import admin
from .models import Review  # Import the model

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('review_id', 'l_id', 'user', 'rating', 'created_at')  # Columns to display
    search_fields = ('user', 'l_id')  # Add search functionality
    list_filter = ('rating', 'created_at')  # Filters for better UI


