from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Listing
from .serializers import ListingSerializer
import os

# ✅ Get all listings
@api_view(['GET'])
def get_all_listings(request):
    listings = Listing.objects.all()
    
    # Ensure image URLs are properly constructed
    for listing in listings:
        if isinstance(listing.image_urls, list):  # ✅ Check if it's already a list
            listing.image_urls = [
                request.build_absolute_uri(f"{settings.MEDIA_URL}{img.strip()}")
                for img in listing.image_urls if img.strip()
            ]
    
    serializer = ListingSerializer(listings, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# ✅ Get single listing
@api_view(['GET'])
def get_listing_by_id(request, l_id):
    try:
        listing = Listing.objects.get(l_id=l_id)

        # Ensure images are properly formatted
        if isinstance(listing.image_urls, list):  # ✅ Check if it's a list
            listing.image_urls = [
                request.build_absolute_uri(f"{settings.MEDIA_URL}{img.strip()}")
                for img in listing.image_urls if img.strip()
            ]

        serializer = ListingSerializer(listing)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Listing.DoesNotExist:
        return Response({'message': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)
 
#  ✅ Create a new listing
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def create_listing(request):
    data = request.data
    image_files = request.FILES.getlist('images')

    # Save images and store only filenames
    image_filenames = []
    for image in image_files:
        filename = default_storage.save(os.path.join("uploads", image.name), ContentFile(image.read()))
        image_filenames.append(os.path.basename(filename))  # Store only the filename

    # Generate new l_id
    last_listing = Listing.objects.order_by('-l_id').first()
    new_lid = (last_listing.l_id + 1) if last_listing else 1

    new_listing = Listing(
        l_id=new_lid,
        title=data['title'],
        location=data['location'],
        description=data.get('description', ''),
        price=data['price'],
        rating=float(data['rating']),
        amenities=data.get('amenities', ''),
        image_urls=",".join(image_filenames)  # Store filenames as a comma-separated string
    )
    new_listing.save()

    # Convert stored filenames to full URLs for response
    new_listing.image_urls = [
        request.build_absolute_uri(f"{settings.MEDIA_URL}{img.strip()}") for img in image_filenames
    ]

    return Response(ListingSerializer(new_listing).data, status=status.HTTP_201_CREATED)

# ✅ Update listing
@api_view(['PUT'])
@parser_classes([MultiPartParser, FormParser])
def update_listing(request, l_id):
    try:
        listing = Listing.objects.get(l_id=l_id)
    except Listing.DoesNotExist:
        return Response({'message': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    image_files = request.FILES.getlist('newImages')

    # Append new images and store only filenames
    new_image_filenames = []
    for image in image_files:
        filename = default_storage.save(os.path.join("uploads", image.name), ContentFile(image.read()))
        new_image_filenames.append(os.path.basename(filename))

    # Merge old and new images
    existing_images = listing.image_urls.split(",") if listing.image_urls else []
    updated_images = existing_images + new_image_filenames
    listing.image_urls = ",".join(updated_images)

    # Update other fields
    listing.title = data.get('title', listing.title)
    listing.location = data.get('location', listing.location)
    listing.price = data.get('price', listing.price)
    listing.rating = float(data.get('rating', listing.rating))
    listing.description = data.get('description', listing.description)
    listing.amenities = data.get('amenities', listing.amenities)

    listing.save()

    # Convert stored filenames to full URLs for response
    listing.image_urls = [
        request.build_absolute_uri(f"{settings.MEDIA_URL}{img.strip()}") for img in updated_images
    ]

    return Response(ListingSerializer(listing).data, status=status.HTTP_200_OK)

# ✅ Delete listing
@api_view(['DELETE'])
def delete_listing(request, l_id):
    try:
        listing = Listing.objects.get(l_id=l_id)

        # Delete associated images
        for img in listing.image_urls.split(","):
            image_path = os.path.join(settings.MEDIA_ROOT, img.strip())
            if os.path.exists(image_path):
                os.remove(image_path)

        listing.delete()
        return Response({'message': 'Listing deleted successfully'}, status=status.HTTP_200_OK)
    except Listing.DoesNotExist:
        return Response({'message': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)
