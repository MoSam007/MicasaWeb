import mysql.connector
import pymongo
import re

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["micasa"]
mongo_collection = mongo_db["listings"]

# Connect to MySQL
mysql_conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="micasa_db"
)
mysql_cursor = mysql_conn.cursor()

def extract_number(text):
    match = re.search(r'\d+', text)
    return int(match.group()) if match else 0

def migrate_listings():
    listings = mongo_collection.find()

    for listing in listings:
        l_id = listing.get("l_id", None)
        title = listing.get("title", "")
        location = listing.get("location", "")
        description = listing.get("description", "")

        # Fix price by removing "Ksh" and any spaces
        price = float(re.sub(r"[^\d.]", "", listing.get("price", "0")))

        rating = listing.get("rating", 0)

        bedrooms = 0
        bathrooms = 0
        amenities = []

        for amenity in listing.get("amenities", []):
            if "bedroom" in amenity.lower():
                bedrooms = extract_number(amenity)
            elif "bathroom" in amenity.lower():
                bathrooms = extract_number(amenity)
            else:
                amenities.append(amenity)

        amenities_str = ", ".join(amenities)

        sql = """
            INSERT INTO apps_listings (l_id, title, location, description, price, bedrooms, bathrooms, rating, amenities)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (l_id, title, location, description, price, bedrooms, bathrooms, rating, amenities_str)
        mysql_cursor.execute(sql, values)

        for img_url in listing.get("imageUrls", []):
            img_sql = "INSERT INTO apps_listing_images (listing_id, image_url) VALUES (%s, %s)"
            mysql_cursor.execute(img_sql, (l_id, img_url))

    mysql_conn.commit()
    print("✅ Listings migrated successfully!")

migrate_listings()

mysql_cursor.close()
mysql_conn.close()
