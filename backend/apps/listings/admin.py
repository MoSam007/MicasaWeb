from django.contrib import admin
from .models import Listing

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('l_id', 'title', 'location', 'price', 'rating', 'likes')
    search_fields = ('title', 'location')
    list_filter = ('location', 'rating')
