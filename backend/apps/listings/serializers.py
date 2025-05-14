from rest_framework import serializers
from .models import Listing

class ListingSerializer(serializers.ModelSerializer):
    image_urls = serializers.SerializerMethodField()
    
    class Meta:
        model = Listing
        fields = '__all__'
        
    def get_image_urls(self, obj):
        """Convert stored filenames to full URLs"""
        request = self.context.get('request')
        if obj.image_urls:
            # Check if image_urls is already a list or still a string
            if isinstance(obj.image_urls, list):
                urls = obj.image_urls
            else:
                # Split by comma and filter out empty strings
                urls = [url.strip() for url in obj.image_urls.split(',') if url.strip()]
            
            # Construct full URLs with media path
            if request:
                base_url = request.build_absolute_uri('/').rstrip('/')
                return [f"{base_url}/uploads/{url}" for url in urls]
            return [f"/uploads/{url}" for url in urls]
        return []