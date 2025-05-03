from flask import request, jsonify, session
from ..db import get_db_connection

def create_composition_route(bp):
    @bp.route('/compositions', methods=['POST'])
    def create_composition():
        ...  # Keep logic from original create_composition endpoint