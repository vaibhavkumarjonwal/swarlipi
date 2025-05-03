from flask import request, jsonify, session, Blueprint
from werkzeug.security import generate_password_hash
from ..db import get_db_connection

signup_blueprint = Blueprint('signup', __name__)

@signup_blueprint.route('/signup', methods=['POST'])
def signup():
    print("Request JSON:", request.get_json())
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    
    # Validate inputs
    if not email or not username or not password:
        return jsonify({"error": "All fields are required"}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Check if username already exists
    cur.execute("SELECT username FROM users WHERE username = %s", (username,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Username already exists"}), 409
    
    # Check if email already exists
    cur.execute("SELECT email FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Email already exists"}), 409
    
    # Store new user
    hashed_password = generate_password_hash(password)
    cur.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
        (username, email, hashed_password)
    )
    
    cur.close()
    conn.close()
    
    # Create session
    session['username'] = username
    session.permanent = True
    print("DONE")
    return jsonify({"message": "Signup successful", "username": username}), 201