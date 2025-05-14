from rest_framework import serializers
from .models import Listing
from django.contrib.auth import get_user_model

User = get_user_model()

class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = ['l_id', 'title', 'likes']

class WishlistSerializer(serializers.ModelSerializer):
    wishlist = ListingSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'wishlist']
