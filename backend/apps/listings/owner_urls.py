from django.urls import path
from .owner_views import (
    get_owner_listings, 
    create_owner_listing, 
    update_owner_listing, 
    delete_owner_listing,
    get_owner_listing_stats
)

urlpatterns = [
    path('', get_owner_listings, name='get_owner_listings'),  # GET /api/owner/listings/
    path('create/', create_owner_listing, name='create_owner_listing'),  # POST /api/owner/listings/create/
    path('<int:listing_id>/update/', update_owner_listing, name='update_owner_listing'),  # PUT /api/owner/listings/1/update/
    path('<int:listing_id>/delete/', delete_owner_listing, name='delete_owner_listing'),  # DELETE /api/owner/listings/1/delete/
    path('stats/', get_owner_listing_stats, name='get_owner_listing_stats'),  # GET /api/owner/listings/stats/
]