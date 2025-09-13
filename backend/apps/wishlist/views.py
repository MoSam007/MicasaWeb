from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Wishlist
from apps.listings.models import Listing
# from apps.users.firebase_auth import firebase_auth_required
import json

# @csrf_exempt
# @firebase_auth_required
def toggle_wishlist(request):
    """Add or remove a listing from the user's wishlist."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            l_id = data.get("l_id")
            if not l_id:
                return JsonResponse({"error": "Listing ID is required."}, status=400)
            listing = get_object_or_404(Listing, id=l_id)
            wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, listing=listing)
            if not created:
                wishlist_item.delete()
                return JsonResponse({"message": "Removed from wishlist"}, status=200)
            return JsonResponse({"message": "Added to wishlist"}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)

# @firebase_auth_required
def get_wishlist(request):
    """Retrieve all listings in the user's wishlist."""
    wishlist_items = Wishlist.objects.filter(user=request.user).select_related("listing")
    listings = [
        {
            "l_id": item.listing.l_id,
            "title": item.listing.title,
            "price": item.listing.price,
            "image": item.listing.image.url if item.listing.image else None,
        }
        for item in wishlist_items
    ]
    return JsonResponse({"wishlist": listings}, status=200)

# @csrf_exempt
# @firebase_auth_required
def check_wishlist_status(request, listing_id):
    """Check if a listing is in the user's wishlist."""
    exists = Wishlist.objects.filter(user=request.user, listing_id=listing_id).exists()
    return JsonResponse({"in_wishlist": exists}, status=200)

# from functools import wraps
# from django.http import JsonResponse
# from apps.users.firebase_auth import verify_firebase_token

# def firebase_auth_required(view_func):
#     @wraps(view_func)
#     def wrapper(request, *args, **kwargs):
#         auth_header = request.headers.get("Authorization")
#         if not auth_header or not auth_header.startswith("Bearer "):
#             return JsonResponse({"error": "Authentication required"}, status=401)
#         id_token = auth_header.split("Bearer ")[1]
#         user = verify_firebase_token(id_token)
#         if not user:
#             return JsonResponse({"error": "Invalid or expired token"}, status=401)
#         request.user = user
#         return view_func(request, *args, **kwargs)
#     return wrapper
