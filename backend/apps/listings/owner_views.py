from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Listing
from .serializers import ListingSerializer
from apps.users.clerk_auth import clerk_auth_required, require_role

from listings import models

@api_view(['GET'])
@clerk_auth_required
@require_role(['owner', 'admin'])
def get_owner_listings(request):
    """Get listings that belong to the current owner"""
    try:
        # Get the current user (owner)
        current_user = request.user
        
        # Filter listings by owner using the ForeignKey relationship
        listings = Listing.objects.filter(owner=current_user).order_by('-created_at')
        
        serializer = ListingSerializer(listings, many=True)
        return Response({
            'listings': serializer.data,
            'count': listings.count(),
            'owner': current_user.username
        })
        
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@clerk_auth_required
@require_role(['owner', 'admin'])
def create_owner_listing(request):
    """Create a new listing for the current owner"""
    try:
        # Get the current user (owner)
        current_user = request.user
        
        # Create a mutable copy of request data
        data = request.data.copy()
        
        # Remove owner from data if present (we'll set it programmatically)
        if 'owner' in data:
            del data['owner']
        if 'owner_id' in data:
            del data['owner_id']
        
        # Create serializer with the data
        serializer = ListingSerializer(data=data)
        
        if serializer.is_valid():
            # Save with the current user as owner
            listing = serializer.save(owner=current_user)
            
            # Return the created listing
            response_serializer = ListingSerializer(listing)
            return Response(response_serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)
            
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['PUT', 'PATCH'])
@clerk_auth_required
@require_role(['owner', 'admin'])
def update_owner_listing(request, listing_id):
    """Update a listing owned by the current owner"""
    try:
        current_user = request.user
        
        # Get the listing and verify ownership using ForeignKey
        listing = get_object_or_404(Listing, l_id=listing_id, owner=current_user)
        
        # Create a mutable copy of request data
        data = request.data.copy()
        
        # Remove owner from data if present (prevent owner changes)
        if 'owner' in data:
            del data['owner']
        if 'owner_id' in data:
            del data['owner_id']
        
        serializer = ListingSerializer(listing, data=data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)
            
    except Listing.DoesNotExist:
        return Response({"error": "Listing not found or access denied"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
@clerk_auth_required
@require_role(['owner', 'admin'])
def delete_owner_listing(request, listing_id):
    """Delete a listing owned by the current owner"""
    try:
        current_user = request.user
        
        # Get the listing and verify ownership using ForeignKey
        listing = get_object_or_404(Listing, l_id=listing_id, owner=current_user)
        
        listing.delete()
        return Response({"message": "Listing deleted successfully"}, status=204)
        
    except Listing.DoesNotExist:
        return Response({"error": "Listing not found or access denied"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@clerk_auth_required
@require_role(['owner', 'admin'])
def get_owner_listing_stats(request):
    """Get statistics for owner's listings"""
    try:
        current_user = request.user
        listings = Listing.objects.filter(owner=current_user)
        
        stats = {
            'total_listings': listings.count(),
            'active_listings': listings.filter(status='active').count(),
            'inactive_listings': listings.filter(status='inactive').count(),
            'pending_listings': listings.filter(status='pending').count(),
            'archived_listings': listings.filter(status='archived').count(),
            'total_likes': sum(listing.likes for listing in listings),
            'average_rating': listings.aggregate(
                avg_rating=models.Avg('rating')
            )['avg_rating'] or 0,
        }
        
        return Response(stats)
        
    except Exception as e:
        return Response({"error": str(e)}, status=500)