from django.db import models
from django.contrib.auth.models import AbstractUser

class UserProfile(AbstractUser):
    uid = models.CharField(max_length=50, unique=True)  # Firebase UID
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=[('hunter', 'Hunter'), ('owner', 'Owner'), ('mover', 'Mover'), ('admin', 'Admin')])
    is_active = models.BooleanField(default=True)

    wishlist = models.ManyToManyField("listings.Listing", related_name="wishlisted_by", blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "uid"]

    @property
    def is_admin(self):
        return self.role == "admin"

    def toggle_wishlist(self, listing):
        """Toggle a listing in the user's wishlist."""
        if listing in self.wishlist.all():
            self.wishlist.remove(listing)
        else:
            self.wishlist.add(listing)
        self.save()

    def __str__(self):
        return self.username
