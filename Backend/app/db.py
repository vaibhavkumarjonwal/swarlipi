import psycopg2
from psycopg2.extras import RealDictCursor

DB_HOST = "db"
DB_NAME = "music_compositions"
DB_USER = "postgres"
DB_PASS = "goti"  # Change in production

def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    conn.autocommit = True
    return conn