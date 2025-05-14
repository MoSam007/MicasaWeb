from django.urls import path
from .fireb_views import get_user_info, update_user_role, create_user, update_user, toggle_user_status, get_user_profile
from .views import get_clerk_user_info, create_clerk_user, update_clerk_user_role
from .migration_views import export_users_for_clerk, migrate_user_to_clerk, update_user_clerk_uid

urlpatterns = [
    # Existing Firebase endpoints
    path("auth/user", get_user_info),
    path('info/', get_user_info, name='user_info'),
    path('role/', update_user_role, name='update_role'),
    path('create/', create_user, name='create_user'),
    path('user/info/', get_user_info, name='legacy_user_info'),
    path('user/role/', update_user_role, name='legacy_update_role'),
    path('profile/<str:uid>/', get_user_profile, name='user_profile'),
    path('update/<str:uid>/', update_user, name='update_user'),
    path('toggle-status/<str:uid>/', toggle_user_status, name='toggle_user_status'),
    
    # New Clerk authentication endpoints
    path('clerk/info/', get_clerk_user_info, name='clerk_user_info'),
    path('clerk/create/', create_clerk_user, name='create_clerk_user'),
    path('clerk/role/', update_clerk_user_role, name='update_clerk_user_role'),
    
    # Migration endpoints (admin only)
    path('migration/export-for-clerk/', export_users_for_clerk, name='export_for_clerk'),
    path('migration/migrate-user/', migrate_user_to_clerk, name='migrate_user'),
    path('migration/update-uid/', update_user_clerk_uid, name='update_uid'),
]