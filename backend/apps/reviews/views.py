from django.db import models
from django.db.models import Avg  # Import Avg for aggregation
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from .models import Review
from .serializers import ReviewSerializer

class ReviewListView(generics.ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class ReviewByListingView(APIView):
    def get(self, request, l_id):
        reviews = Review.objects.filter(l_id=l_id).order_by('-created_at')
        total_reviews = reviews.count()  # Ensure total_reviews is defined
        average_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0  # Use imported Avg
        
        return Response({
            "reviews": ReviewSerializer(reviews, many=True).data,
            "averageRating": round(average_rating, 1),
            "totalReviews": total_reviews  # No more undefined variable error
        })

class AddReviewView(APIView):
    def post(self, request, l_id):
        data = request.data
        data["l_id"] = l_id
        serializer = ReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Review added successfully", "data": serializer.data}, status=201)
        return Response(serializer.errors, status=400)

class DeleteReviewView(APIView):
    permission_classes = [IsAdminUser]  # Only admins can delete reviews

    def delete(self, request, review_id):
        try:
            review = Review.objects.get(id=review_id)
            review.delete()
            return Response({"message": "Review deleted successfully"}, status=204)
        except Review.DoesNotExist:
            return Response({"error": "Review not found"}, status=404)
