from django.db import models
from apps.users.models import UserProfile  # Import UserProfile instead of redefining User

class Listing(models.Model):
    l_id = models.IntegerField(unique=True)  # Keep in sync with your existing IDs
    title = models.CharField(max_length=255)
    likes = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title


class Wishlist(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="wishlist_items")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="wishlist_entries")

    def toggle_wishlist(self):
        """Toggle a listing in the user's wishlist and update listing likes."""
        if self.listing in self.user.wishlist.all():
            self.user.wishlist.remove(self.listing)
            self.listing.likes = max(0, self.listing.likes - 1)
        else:
            self.user.wishlist.add(self.listing)
            self.listing.likes += 1

        self.listing.save()
        self.user.save()
