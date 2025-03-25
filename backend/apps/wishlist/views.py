from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Listing
from django.contrib.auth import get_user_model
from .serializers import WishlistSerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request, listing_id):
    user = request.user
    listing = get_object_or_404(Listing, l_id=listing_id)

    user.toggle_wishlist(listing)

    return Response({
        "wishlist": WishlistSerializer(user).data['wishlist'],
        "likes": listing.likes,
        "isInWishlist": listing in user.wishlist.all()
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_wishlist_status(request, listing_id):
    user = request.user
    listing = get_object_or_404(Listing, l_id=listing_id)

    return Response({
        "isInWishlist": listing in user.wishlist.all(),
        "likes": listing.likes
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    user = request.user
    serializer = WishlistSerializer(user)
    return Response(serializer.data['wishlist'], status=status.HTTP_200_OK)
