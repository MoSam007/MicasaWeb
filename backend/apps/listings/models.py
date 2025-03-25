from django.db import models

class Listing(models.Model):
    l_id = models.AutoField(primary_key=True)  # Ensure it's an auto-incrementing primary key
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.FloatField()
    description = models.TextField()
    amenities = models.JSONField(default=list)
    image_urls = models.JSONField(default=list)
    likes = models.IntegerField(default=0)

    def __str__(self):
        return self.title