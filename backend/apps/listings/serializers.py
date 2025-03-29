from rest_framework import serializers
from .models import Listing

class ListingSerializer(serializers.ModelSerializer):
    image_urls = serializers.SerializerMethodField()
    
    class Meta:
        model = Listing
        fields = '__all__'
        
    def get_image_urls(self, obj):
        """Convert stored comma-separated string to list of image filenames"""
        request = self.context.get('request')
        if obj.image_urls:
            # Check if image_urls is already a list or still a string
            if isinstance(obj.image_urls, list):
                urls = obj.image_urls
            else:
                # Split by comma and filter out empty strings
                urls = [url.strip() for url in obj.image_urls.split(',') if url.strip()]
                
            # Return just the filenames - the frontend will construct the full URLs
            return urls
        return []