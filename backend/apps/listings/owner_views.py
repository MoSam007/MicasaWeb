from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Listing
from .serializers import ListingSerializer
from apps.users.clerk_auth import clerk_auth_required, require_role

@api_view(['GET'])
@clerk_auth_required
@require_role(['owner', 'admin'])
def get_owner_listings(request):
    """Get listings that belong to the current owner"""
    try:
        # Get the owner ID from the JWT token
        clerk_payload = getattr(request, 'clerk_payload', {})
        
        # Try different ways to get the owner ID
        owner_id = None
        
        # First, check if current user is the owner
        if request.user.role == 'owner':
            owner_id = request.user.uid
        
        # Also check JWT claims for owner ID
        hasura_claims = clerk_payload.get('https://hasura.io/jwt/claims', {})
        jwt_owner_id = hasura_claims.get('x-hasura-owner-id')
        
        if jwt_owner_id:
            owner_id = jwt_owner_id
        
        if not owner_id:
            return Response({"error": "Owner ID not found"}, status=400)
        
        # Filter listings by owner
        # Assuming your Listing model has an 'owner_id' field
        # If not, you'll need to add this field to your model
        listings = Listing.objects.filter(owner_id=owner_id)
        
        serializer = ListingSerializer(listings, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@clerk_auth_required
@require_role(['owner', 'admin'])
def create_owner_listing(request):
    """Create a new listing for the current owner"""
    try:
        # Get the owner ID
        owner_id = None
        if request.user.role == 'owner':
            owner_id = request.user.uid
        
        clerk_payload = getattr(request, 'clerk_payload', {})
        hasura_claims = clerk_payload.get('https://hasura.io/jwt/claims', {})
        jwt_owner_id = hasura_claims.get('x-hasura-owner-id')
        
        if jwt_owner_id:
            owner_id = jwt_owner_id
        
        if not owner_id:
            return Response({"error": "Owner ID not found"}, status=400)
        
        # Add owner_id to the request data
        data = request.data.copy()
        data['owner_id'] = owner_id
        
        serializer = ListingSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
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
        # Get the owner ID
        owner_id = None
        if request.user.role == 'owner':
            owner_id = request.user.uid
        
        clerk_payload = getattr(request, 'clerk_payload', {})
        hasura_claims = clerk_payload.get('https://hasura.io/jwt/claims', {})
        jwt_owner_id = hasura_claims.get('x-hasura-owner-id')
        
        if jwt_owner_id:
            owner_id = jwt_owner_id
        
        if not owner_id:
            return Response({"error": "Owner ID not found"}, status=400)
        
        # Get the listing and verify ownership
        try:
            listing = Listing.objects.get(l_id=listing_id, owner_id=owner_id)
        except Listing.DoesNotExist:
            return Response({"error": "Listing not found or access denied"}, status=404)
        
        serializer = ListingSerializer(listing, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)
            
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
@clerk_auth_required
@require_role(['owner', 'admin'])
def delete_owner_listing(request, listing_id):
    """Delete a listing owned by the current owner"""
    try:
        # Get the owner ID
        owner_id = None
        if request.user.role == 'owner':
            owner_id = request.user.uid
        
        clerk_payload = getattr(request, 'clerk_payload', {})
        hasura_claims = clerk_payload.get('https://hasura.io/jwt/claims', {})
        jwt_owner_id = hasura_claims.get('x-hasura-owner-id')
        
        if jwt_owner_id:
            owner_id = jwt_owner_id
        
        if not owner_id:
            return Response({"error": "Owner ID not found"}, status=400)
        
        # Get the listing and verify ownership
        try:
            listing = Listing.objects.get(l_id=listing_id, owner_id=owner_id)
            listing.delete()
            return Response({"message": "Listing deleted successfully"}, status=204)
        except Listing.DoesNotExist:
            return Response({"error": "Listing not found or access denied"}, status=404)
            
    except Exception as e:
        return Response({"error": str(e)}, status=500)