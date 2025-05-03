from flask import Blueprint, request, jsonify, session
import os
from ..config import PATHS
from app.services.initial_extraction import extract_alphabets
from app.services.save_data import save_rows_to_file
from app.services.annotate_pdf import annotate_pdf_rows
initial_rows_blueprint = Blueprint('initial_rows', __name__)

@initial_rows_blueprint.route('/get_initial_rows', methods=['GET'])
def get_initial_rows():
    pdf_path = PATHS['curr_pdf_path']
    initial_seg_folder = PATHS['initial_segmentation']
    all_coordinates, all_row_mappings = extract_alphabets(pdf_path, initial_seg_folder)
    save_rows_to_file(all_coordinates, "coordinates")
    save_rows_to_file(all_row_mappings, "row_mapping")

    annotated_images_folder = PATHS['annotated_images']
    annotate_pdf_rows(pdf_path, all_row_mappings, all_coordinates, annotated_images_folder)
    
    row_paths = []
    for filename in os.listdir(annotated_images_folder):
        if filename.endswith('.png'):
            row_paths.append(filename)
    return jsonify({
        "row_paths": row_paths,
    }), 200