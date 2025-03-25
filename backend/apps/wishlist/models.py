from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    wishlist = models.ManyToManyField('listings.Listing', related_name='wishlisted_by', blank=True)

    def toggle_wishlist(self, listing):
        """Toggle a listing in the user's wishlist and update listing likes."""
        if listing in self.wishlist.all():
            self.wishlist.remove(listing)
            listing.likes = max(0, listing.likes - 1)
        else:
            self.wishlist.add(listing)
            listing.likes += 1
        listing.save()
        self.save()

class Listing(models.Model):
    l_id = models.IntegerField(unique=True)  # Keep in sync with your existing IDs
    title = models.CharField(max_length=255)
    likes = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title
