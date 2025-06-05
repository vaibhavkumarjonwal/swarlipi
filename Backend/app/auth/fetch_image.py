from flask import make_response, send_from_directory, abort, Blueprint, request
from werkzeug.utils import secure_filename
import os
from urllib.parse import unquote
from ..config import PATHS

fetch_image_blueprint = Blueprint('fetch_image', __name__)

@fetch_image_blueprint.route('/fetch_image/<path:filename>', methods=['GET'])
def serve_image(filename):
    # Decode URL-encoded path (e.g., %2F -> /)
    decoded_path = unquote(filename)
    
    # Just keep the filename, no directory traversal
    filename_only = secure_filename(os.path.basename(decoded_path))

    search_dirs = [
        PATHS['working_composition'],
        PATHS['working_composition_segmented'],
        PATHS['annotated_images'],
    ]

    for directory in search_dirs:
        file_path = os.path.join(directory, filename_only)
        if os.path.exists(file_path):
            response = make_response(send_from_directory(directory, filename_only))
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
            return response

    print(f"File not found in all directories: {filename_only}")
    return abort(404, description=f"File not found: {filename_only}")

