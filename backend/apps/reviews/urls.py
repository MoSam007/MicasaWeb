from django.urls import path
from .views import ReviewListView, ReviewByListingView, AddReviewView, DeleteReviewView

urlpatterns = [
    path('', ReviewListView.as_view(), name='all-reviews'),
    path('<int:l_id>/', ReviewByListingView.as_view(), name='listing-reviews'),
    path('<int:l_id>/add/', AddReviewView.as_view(), name='add-review'),
    path('delete/<int:review_id>/', DeleteReviewView.as_view(), name='delete-review'),  # Delete review endpoint
]
