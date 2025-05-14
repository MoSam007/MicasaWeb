from django.urls import path
from .views import toggle_wishlist, get_wishlist, check_wishlist_status

urlpatterns = [
    path('<int:listing_id>/', toggle_wishlist, name='toggle-wishlist'),
    path('check/<int:listing_id>/', check_wishlist_status, name='check-wishlist'),
    path('', get_wishlist, name='get-wishlist'),
]
