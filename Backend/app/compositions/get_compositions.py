from flask import request, jsonify, session
from ..db import get_db_connection
from psycopg2.extras import RealDictCursor

def get_compositions_route(bp):
    @bp.route('/compositions', methods=['GET'])
    def get_compositions():
        ...  # Keep logic from original get_compositions endpoint
