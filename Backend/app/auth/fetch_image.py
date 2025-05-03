from flask import make_response, send_from_directory, abort, Blueprint
from werkzeug.utils import secure_filename
import os
from ..config import PATHS

fetch_image_blueprint = Blueprint('fetch_image', __name__)

@fetch_image_blueprint.route('/fetch_image/<filename>', methods=['GET'])
def serve_image(filename):
    # Ensure cross-platform compatibility (in case \ is used)
    filename = filename.replace('\\', '/')
    filename_only = os.path.basename(filename)
    filename_only = secure_filename(filename_only)

    base_dir = PATHS['working_composition']
    file_path = os.path.join(base_dir, filename_only)

    if not os.path.exists(file_path):
        other_base_dir = PATHS['working_composition_segmented']
        file_path = os.path.join(other_base_dir, filename_only)
        if not os.path.exists(file_path):
            third_base_dir = PATHS['annotated_images']
            file_path = os.path.join(third_base_dir, filename_only)
            if not os.path.exists(file_path):
                print(f"File not found in all directories: {file_path}")
                return abort(404, description=f"File not found: {filename_only}")
            else:
                response = make_response(send_from_directory(third_base_dir, filename))
                response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
                response.headers["Pragma"] = "no-cache"
                response.headers["Expires"] = "0"
                return response
                return send_from_directory(third_base_dir, filename_only)
        else:
            return send_from_directory(other_base_dir, filename_only)
    return send_from_directory(base_dir, filename_only)