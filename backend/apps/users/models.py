from django.db import models

class UserProfile(models.Model):
    uid = models.CharField(max_length=50, unique=True)  # Firebase UID
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=[('hunter', 'Hunter'), ('owner', 'Owner'), ('mover', 'Mover'), ('admin', 'Admin')])
    is_active = models.BooleanField(default=True)
