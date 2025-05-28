# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/listings/', include('apps.listings.urls')),
    path('api/profiles/', include('apps.profiles.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/wishlist/', include('apps.wishlist.urls')),
    path('api/owner/listings/', include('apps.listings.owner_urls')), 
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Also serve uploads directly under /api/uploads/ for consistency with frontend expectations
if settings.DEBUG:
    from django.views.static import serve
    from django.urls import re_path
    
    urlpatterns += [
        re_path(r'^api/uploads/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
        re_path(r'^api/static/(?P<path>.*)$', serve, {
            'document_root': settings.STATIC_ROOT,
        }),
    ]