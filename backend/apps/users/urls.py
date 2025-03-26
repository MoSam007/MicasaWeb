from django.urls import path
from .views import get_user_info

urlpatterns = [
    path("auth/user", get_user_info),
]
