import json
import mysql.connector

# Connect to MySQL
mysql_conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="micasa_db"
)
mysql_cursor = mysql_conn.cursor()

# Load JSON file
with open("listings.json", "r", encoding="utf-8") as json_file:
    listings = json.load(json_file)

# Insert Data (Avoid Duplicates)
for listing in listings:
    l_id = listing.get("l_id")
    
    # Check if listing already exists
    mysql_cursor.execute("SELECT COUNT(*) FROM apps_listings WHERE l_id = %s", (l_id,))
    exists = mysql_cursor.fetchone()[0]

    if exists:
        print(f"⚠️ Skipping duplicate listing {l_id}")
        continue  # Skip duplicate entry

    try:
        price = float(listing.get("price", "0").replace("Ksh", "").strip())
    except ValueError:
        price = 0

    bedrooms = next((int(a.split()[0]) for a in listing.get("amenities", []) if "bedroom" in a.lower()), 0)
    bathrooms = next((int(a.split()[0]) for a in listing.get("amenities", []) if "bathroom" in a.lower()), 0)
    amenities_str = ", ".join(listing.get("amenities", []))

    sql = """
        INSERT INTO apps_listings (l_id, title, location, description, price, bedrooms, bathrooms, rating, amenities)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        l_id,
        listing.get("title", ""),
        listing.get("location", ""),
        listing.get("description", ""),
        price,
        bedrooms,
        bathrooms,
        float(listing.get("rating", 0)),
        amenities_str
    )

    try:
        mysql_cursor.execute(sql, values)
    except mysql.connector.Error as e:
        print(f"❌ Error inserting listing {l_id}: {e}")

mysql_conn.commit()
mysql_cursor.close()
mysql_conn.close()

print("✅ Listings imported successfully, duplicates skipped!")
