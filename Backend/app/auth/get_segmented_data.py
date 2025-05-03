from collections import defaultdict
from flask import Blueprint, request, jsonify, session
import os
from app.auth.final_rows import segmented_data_store

get_segmented_data_blueprint = Blueprint('get_segmented_data', __name__)

@get_segmented_data_blueprint.route('/get_segmented_data', methods=['GET'])
def get_segmented_data():
    global segmented_data_store
    if segmented_data_store:
        return jsonify(segmented_data_store)
    else:
        return jsonify({'error': 'No data available'}), 404