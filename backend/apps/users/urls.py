from django.urls import path
from .views import get_clerk_user_info, create_clerk_user, update_clerk_user_role

urlpatterns = [
    # Clerk authentication endpoints only
    path('clerk/info/', get_clerk_user_info, name='clerk_user_info'),
    path('clerk/create/', create_clerk_user, name='create_clerk_user'),
    path('clerk/role/', update_clerk_user_role, name='update_clerk_user_role'),
]