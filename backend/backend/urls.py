from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/listings/", include("apps.listings.urls")),  # Fixed
    path("api/reviews/", include("apps.reviews.urls")), 
    path("api/wishlist/", include("apps.wishlist.urls")),  
    path("api/users/", include("apps.users.urls")), 
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
