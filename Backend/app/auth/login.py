from flask import request, jsonify, session, Blueprint
from werkzeug.security import check_password_hash
from ..db import get_db_connection
from psycopg2.extras import RealDictCursor

login_blueprint = Blueprint('login', __name__)

@login_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print("Received data:", data)

    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT username, email, password_hash FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid username or password"}), 401
    
    session['username'] = username
    session.permanent = True
    print("Session created for user:", username)
    return jsonify({"message": "Login successful", "username": username}), 200