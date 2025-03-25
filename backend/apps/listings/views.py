from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from .models import Listing
from .serializers import ListingSerializer

# ✅ Get all listings
@api_view(['GET'])
def get_all_listings(request):
    listings = Listing.objects.all()
    serializer = ListingSerializer(listings, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# ✅ Get single listing
@api_view(['GET'])
def get_listing_by_id(request, l_id):
    try:
        listing = Listing.objects.get(l_id=l_id)
        serializer = ListingSerializer(listing)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Listing.DoesNotExist:
        return Response({'message': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)

# ✅ Create a new listing
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def create_listing(request):
    data = request.data
    image_files = request.FILES.getlist('images')

    # Save images and generate URLs
    image_urls = []
    for image in image_files:
        path = default_storage.save(f'uploads/{image.name}', image)
        image_urls.append(default_storage.url(path))

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
        amenities=data.get('amenities', '').split(','),
        image_urls=image_urls
    )
    new_listing.save()

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

    # Append new images
    for image in image_files:
        path = default_storage.save(f'uploads/{image.name}', image)
        listing.image_urls.append(default_storage.url(path))

    # Update fields
    listing.title = data.get('title', listing.title)
    listing.location = data.get('location', listing.location)
    listing.price = data.get('price', listing.price)
    listing.rating = float(data.get('rating', listing.rating))
    listing.description = data.get('description', listing.description)
    listing.amenities = data.get('amenities', listing.amenities).split(',')

    listing.save()
    return Response(ListingSerializer(listing).data, status=status.HTTP_200_OK)

# ✅ Delete listing
@api_view(['DELETE'])
def delete_listing(request, l_id):
    try:
        listing = Listing.objects.get(l_id=l_id)
        listing.delete()
        return Response({'message': 'Listing deleted successfully'}, status=status.HTTP_200_OK)
    except Listing.DoesNotExist:
        return Response({'message': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)
    