from flask import request, jsonify, session
from ..db import get_db_connection
from psycopg2.extras import RealDictCursor

def get_composition_route(bp):
    @bp.route('/compositions/<int:composition_id>', methods=['GET'])
    def get_composition(composition_id):
        ...  # Keep logic from original get_composition endpoint
