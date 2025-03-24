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
with open("reviews.json", "r", encoding="utf-8") as json_file:
    reviews = json.load(json_file)

# Insert Data
for review in reviews:
    try:
        sql = """
            INSERT INTO apps_reviews (l_id, user, rating, comment, created_at)
            VALUES (%s, %s, %s, %s, %s)
        """
        values = (
            review.get("l_id"),
            review.get("user", "Anonymous"),
            review.get("rating", 0),
            review.get("comment", ""),
            review.get("created_at", None)  # MySQL will set the default timestamp if None
        )
        mysql_cursor.execute(sql, values)
    
    except mysql.connector.Error as err:
        print(f"❌ Error inserting review for listing {review.get('l_id')}: {err}")

mysql_conn.commit()
mysql_cursor.close()
mysql_conn.close()

print("✅ Reviews imported successfully into MySQL!")
