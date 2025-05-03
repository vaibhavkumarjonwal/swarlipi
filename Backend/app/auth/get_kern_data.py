from collections import defaultdict
from flask import Blueprint, request, jsonify, session
import os

get_kern_data_blueprint = Blueprint('get_kern_data', __name__)

@get_kern_data_blueprint.route('/get_kern_data', methods=['GET'])
def get_kern_data():
    global kern_data_store
    if kern_data_store:
        return jsonify(kern_data_store)
    else:
        return jsonify({'error': 'No kern data available'}), 404