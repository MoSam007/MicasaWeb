from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/listings/", include("apps.listings.urls")),  # Fixed
    # path("api/reviews/", include("apps.reviews.urls")), 
    # path("api/wishlist/", include("apps.wishlist.urls")),  
    # path("api/users/", include("apps.users.urls")), 
]
