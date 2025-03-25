from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", include("listings.urls")), 
    path("api/", include("reviews.urls")),
    path("api/", include("wishlist.urls")),  
    path("api/", include("users.urls")), 
]