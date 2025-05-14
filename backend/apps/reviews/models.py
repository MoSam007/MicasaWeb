from django.db import models

class Review(models.Model):
    review_id = models.AutoField(primary_key=True)
    l_id = models.IntegerField()  # Refers to Listing
    user = models.EmailField()
    # user_image = models.URLField(blank=True, null=True) // define this in db and set it to be extraced from user's email
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "apps_reviews"  # Use existing MySQL table
        ordering = ['-created_at']

    def __str__(self):
        return f"Review {self.review_id} - Listing {self.l_id}"
