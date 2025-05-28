# Generated migration file: backend/apps/listings/migrations/0002_add_owner_and_timestamps.py

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone

class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('listings', '0001_initial'),  # Replace with your latest migration
    ]

    operations = [
        migrations.AddField(
            model_name='listing',
            name='owner',
            field=models.ForeignKey(
                default=1,  # Temporary default - will be updated
                on_delete=django.db.models.deletion.CASCADE,
                related_name='listings',
                to=settings.AUTH_USER_MODEL,
                help_text='The owner who created this listing'
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='listing',
            name='created_at',
            field=models.DateTimeField(
                auto_now_add=True,
                default=django.utils.timezone.now
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='listing',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='listing',
            name='status',
            field=models.CharField(
                choices=[
                    ('active', 'Active'),
                    ('inactive', 'Inactive'),
                    ('pending', 'Pending Review'),
                    ('archived', 'Archived'),
                ],
                default='active',
                max_length=20
            ),
        ),
        migrations.AddIndex(
            model_name='listing',
            index=models.Index(fields=['owner', 'status'], name='listings_listing_owner_status_idx'),
        ),
        migrations.AddIndex(
            model_name='listing',
            index=models.Index(fields=['status', 'created_at'], name='listings_listing_status_created_idx'),
        ),
    ]