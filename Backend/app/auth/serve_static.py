from flask import send_from_directory, abort, Blueprint
from werkzeug.utils import secure_filename
import os
from ..config import PATHS

image_blueprint = Blueprint('image', __name__)

@image_blueprint.route('/image/<filename>', methods=['GET'])
def serve_image(filename):
    base_dir = PATHS['annotated_images']
    filename = secure_filename(filename)
    file_path = os.path.join(base_dir, filename)
    
    print(f"Requested file: {filename}")
    print(f"Base directory: {base_dir}")
    print(f"Full file path: {file_path}")
    print(f"File exists: {os.path.exists(file_path)}")

    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return abort(404, description=f"File not found: {filename}")
    
    return send_from_directory(base_dir, filename)