from django.urls import path
from .views import get_user_info
from . import views

urlpatterns = [
    path("auth/user", get_user_info),
    path('info/', views.get_user_info, name='user_info'),
    path('role/', views.update_user_role, name='update_role'),
    path('user/info/', views.get_user_info, name='legacy_user_info'),
    path('user/role/', views.update_user_role, name='legacy_update_role'),
]
