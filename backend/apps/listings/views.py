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
    
    # Process each listing
    for listing in listings:
        # Convert image_urls to array if it's a string
        if isinstance(listing.image_urls, str):
            listing.image_urls = listing.image_urls.split(',')
            listing.image_urls = [img.strip() for img in listing.image_urls if img.strip()]
        
        # Convert amenities to array if it's a string
        if isinstance(listing.amenities, str):
            listing.amenities = listing.amenities.split(',')
            listing.amenities = [amenity.strip() for amenity in listing.amenities if amenity.strip()]
    
    serializer = ListingSerializer(listings, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

# ✅ Get single listing
@api_view(['GET'])
def get_listing_by_id(request, l_id):
    try:
        listing = Listing.objects.get(l_id=l_id)

        # Convert image_urls to array if it's a string
        if isinstance(listing.image_urls, str):
            listing.image_urls = listing.image_urls.split(',')
            listing.image_urls = [img.strip() for img in listing.image_urls if img.strip()]
            
        # Convert amenities to array if it's a string
        if isinstance(listing.amenities, str):
            listing.amenities = listing.amenities.split(',')
            listing.amenities = [amenity.strip() for amenity in listing.amenities if amenity.strip()]

        serializer = ListingSerializer(listing, context={'request': request})
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
    
    # Process amenities
    amenities = data.get('amenities', '')
    if isinstance(amenities, str):
        amenities = amenities.split(',')

    new_listing = Listing(
        l_id=new_lid,
        title=data['title'],
        location=data['location'],
        description=data.get('description', ''),
        price=data['price'],
        rating=float(data['rating']),
        amenities=amenities,
        image_urls=image_filenames  # Store as a list directly
    )
    new_listing.save()

    serializer = ListingSerializer(new_listing, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

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

    # Append new images
    new_image_filenames = []
    for image in image_files:
        filename = default_storage.save(os.path.join("uploads", image.name), ContentFile(image.read()))
        new_image_filenames.append(os.path.basename(filename))

    # Get existing images as a list
    existing_images = []
    if isinstance(listing.image_urls, str):
        existing_images = listing.image_urls.split(',')
        existing_images = [img.strip() for img in existing_images if img.strip()]
    elif isinstance(listing.image_urls, list):
        existing_images = listing.image_urls

    # Merge old and new images
    updated_images = existing_images + new_image_filenames
    
    # Process amenities
    amenities = data.get('amenities', listing.amenities)
    if isinstance(amenities, str):
        amenities = amenities.split(',')
        amenities = [amenity.strip() for amenity in amenities if amenity.strip()]

    # Update fields
    listing.title = data.get('title', listing.title)
    listing.location = data.get('location', listing.location)
    listing.price = data.get('price', listing.price)
    listing.rating = float(data.get('rating', listing.rating))
    listing.description = data.get('description', listing.description)
    listing.amenities = amenities
    listing.image_urls = updated_images

    listing.save()

    serializer = ListingSerializer(listing, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

# ✅ Delete listing
@api_view(['DELETE'])
def delete_listing(request, l_id):
    try:
        listing = Listing.objects.get(l_id=l_id)

        # Delete associated images
        image_urls = []
        if isinstance(listing.image_urls, str):
            image_urls = listing.image_urls.split(',')
        elif isinstance(listing.image_urls, list):
            image_urls = listing.image_urls
            
        for img in image_urls:
            img = img.strip()
            if img:
                image_path = os.path.join(settings.MEDIA_ROOT, img)
                if os.path.exists(image_path):
                    os.remove(image_path)

        listing.delete()
        return Response({'message': 'Listing deleted successfully'}, status=status.HTTP_200_OK)
    except Listing.DoesNotExist:
        return Response({'message': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)