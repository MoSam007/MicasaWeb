from rest_framework import serializers
from .models import Listing

class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = '__all__'
    def get_full_image_urls(self, obj):
        request = self.context.get('request')
        if obj.image_urls:
            return [request.build_absolute_uri(url) for url in obj.image_urls]
        return []