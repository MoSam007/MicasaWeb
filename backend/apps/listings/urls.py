from django.urls import path
from .views import get_all_listings, get_listing_by_id, create_listing, update_listing, delete_listing

urlpatterns = [
    path('', get_all_listings, name='get_all_listings'),  # GET /api/listings/
    path('<int:l_id>/', get_listing_by_id, name='get_listing_by_id'),  # GET /api/listings/1/
    path('create/', create_listing, name='create_listing'),  # POST /api/listings/create/
    path('<int:l_id>/update/', update_listing, name='update_listing'),  # PUT /api/listings/1/update/
    path('<int:l_id>/delete/', delete_listing, name='delete_listing'),  # DELETE /api/listings/1/delete/
]
