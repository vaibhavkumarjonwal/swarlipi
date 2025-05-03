from flask import session, jsonify, request, Blueprint
from ..db import get_db_connection
from psycopg2.extras import RealDictCursor

get_user_blueprint = Blueprint('user', __name__)

@get_user_blueprint.route('/user', methods=['GET'])
def get_user():
    if 'username' not in session:
        return jsonify({"authenticated": False}), 401
    
    username = session['username']
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT username, email FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not user:
        session.pop('username', None)
        return jsonify({"authenticated": False}), 401
    
    return jsonify({
        "authenticated": True,
        "username": user['username'],
        "email": user['email']
    }), 200