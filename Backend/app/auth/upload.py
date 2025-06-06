from flask import Blueprint, request, jsonify, session, make_response
import os
from ..config import PATHS

upload_blueprint = Blueprint('upload', __name__)

@upload_blueprint.route('/upload', methods=['POST'])
def upload_pdf():
    print("UPLOAD PAGE")
    print("cookies: ", request.cookies)
    print("session username: ", session.get('username'))
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400

    if file and file.filename.endswith('.pdf'):
        
        upload_folder = PATHS['pdf_path']
        os.makedirs(upload_folder, exist_ok=True) 
        file_path = os.path.join(upload_folder, file.filename)
        
        file.save(file_path)
        PATHS['curr_pdf_path'] = file_path
        response = make_response(jsonify({
            "message": "File uploaded successfully",
            "file_path": upload_folder,
        }), 200)
        response.headers['Access-Control-Allow-Origin'] = 'http://164.52.205.176:3000'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

    return jsonify({"error": "Invalid file format. Only PDFs are allowed."}), 400
