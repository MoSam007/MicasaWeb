from rest_framework import serializers
from .models import Review
import hashlib

class ReviewSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(source="created_at", format="%Y-%m-%d %H:%M:%S", read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['review_id', 'l_id', 'user', 'rating', 'comment', 'date', 'avatar']

    def get_avatar(self, obj):
        email_hash = hashlib.md5(obj.user.encode('utf-8')).hexdigest()
        return f"https://www.gravatar.com/avatar/{email_hash}?d=identicon"
