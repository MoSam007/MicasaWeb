import json
import os
import django

# Setup Django Environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "micasa.settings")  # Replace with your actual project name
django.setup()

from listings.models import Listing  # Import your model

# Load JSON Data
with open("listings.json", "r", encoding="utf-8") as file:
    listings = json.load(file)

# Function to clean and prepare data
def clean_price(price_str):
    """Remove 'Ksh ' from price and convert to integer."""
    return int(price_str.replace("Ksh ", "").replace(",", "").strip())

def clean_amenities(amenities):
    """Remove empty strings from amenities list."""
    return [amenity for amenity in amenities if amenity.strip()]

def insert_listings():
    for listing in listings:
        try:
            # Create listing object and save
            Listing.objects.update_or_create(
                l_id=listing["l_id"],  # Ensure unique ID
                defaults={
                    "title": listing["title"],
                    "location": listing["location"],
                    "description": listing["description"],
                    "price": clean_price(listing["price"]),  # Convert price
                    "amenities": clean_amenities(listing["amenities"]),  # Remove empty values
                    "rating": listing["rating"],
                    "imageUrls": listing["imageUrls"],  # Store as JSONField or ArrayField
                }
            )
            print(f"✅ Inserted: {listing['title']}")

        except Exception as e:
            print(f"❌ Error inserting {listing['title']}: {e}")

# Run the insert function
if __name__ == "__main__":
    insert_listings()
