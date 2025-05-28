from django.db import models
from django.conf import settings

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
    
    # Add owner relationship
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='listings',
        help_text="The owner who created this listing"
    )
    
    # Add timestamps for better tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Add status field for listing management
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending Review'),
        ('archived', 'Archived'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.owner.username}"
    
    @property
    def owner_id(self):
        """Return the owner's UID for compatibility with existing code"""
        return self.owner.uid if self.owner else None