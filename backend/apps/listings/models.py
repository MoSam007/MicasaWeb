from django.db import models

class Listing(models.Model):
    l_id = models.IntegerField(unique=True)  # Keeping it unique like Mongo's _id
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Using Decimal for accuracy
    amenities = models.JSONField()  # Storing as a JSON list
    rating = models.FloatField()
    image_urls = models.JSONField()  # List of image URLs
    likes = models.IntegerField(default=0)

    def __str__(self):
        return self.title
