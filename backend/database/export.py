import pymongo
import json
import csv
from datetime import datetime

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["micasa"]

# Collections
listings_collection = mongo_db["listings"]
reviews_collection = mongo_db["reviews"]
# Custom JSON Encoder for datetime objects
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

# Export function
def export_to_json_csv(collection, filename):
    data = list(collection.find({}))

    # Remove MongoDB '_id' field (optional)
    for item in data:
        item.pop("_id", None)

    # Save to JSON (using custom encoder)
    with open(f"{filename}.json", "w", encoding="utf-8") as json_file:
        json.dump(data, json_file, indent=4, cls=DateTimeEncoder)

    # Save to CSV
    keys = data[0].keys() if data else []
    with open(f"{filename}.csv", "w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=keys)
        writer.writeheader()
        writer.writerows(data)

# Export Listings
export_to_json_csv(listings_collection, "listings")

# Export Reviews
export_to_json_csv(reviews_collection, "reviews")

print("✅ Listings & Reviews exported successfully!")
