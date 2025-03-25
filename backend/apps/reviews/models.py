from django.db import models

class Review(models.Model):
    l_id = models.IntegerField(db_index=True)  # Refers to Listing
    user_email = models.EmailField()
    user_image = models.URLField(blank=True, null=True)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "apps_reviews"  # Use existing MySQL table
        ordering = ['-created_at']

    def __str__(self):
        return f"Review {self.id} - Listing {self.l_id}"
