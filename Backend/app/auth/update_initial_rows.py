from flask import request, jsonify, session, Blueprint
import os

from ..config import PATHS
from app.services.save_data import load_rows_from_file, save_rows_to_file
from app.services.copy_image_in_row_range import copy_images_in_row_range
from app.services.save_metadata import save_composition_metadata
from app.services.mapping import get_row_image_counts
from app.services.identifications import get_sam_and_taalis_rows

update_initial_rows_blueprint = Blueprint('update_initial_rows', __name__)

@update_initial_rows_blueprint.route('/update_initial_rows', methods=['POST'])
def update_initial_rows():
    data = request.get_json()
    first_row = int(data.get('startRow'))
    last_row = int(data.get('endRow'))
    raag_name = data.get('raag')
    taal_name = data.get('taal')
    lay = data.get('laya')
    source_name = data.get('source')
    page_number = int(data.get('pageNo'))
    working_composition_folder = PATHS['working_composition']
    initial_segmentation_folder = PATHS['initial_segmentation']
    annotated_images_folder = PATHS['annotated_images']

    copy_images_in_row_range(initial_segmentation_folder, working_composition_folder, first_row, last_row)
    save_composition_metadata(raag_name, taal_name, lay, source_name=source_name, page_number=page_number)
    row_image_count = get_row_image_counts(working_composition_folder)
    sam_and_taalis_rows = get_sam_and_taalis_rows(row_image_count, taal_name)
    
    metadata = load_rows_from_file("composition_metadata")
    metadata['first_row'] = first_row
    metadata['last_row'] = last_row
    save_rows_to_file(metadata, "composition_metadata")
    row_paths = []
    for filename in os.listdir(annotated_images_folder):
        if filename.endswith('.png'):
            row_num = int(filename.split('_')[2].split('.')[0][1:])
            if row_num >= first_row and row_num <= last_row:
                row_paths.append(filename)

    save_rows_to_file(sam_and_taalis_rows, "sam_and_taalis_rows")
    return jsonify({
        'row_paths': row_paths,
        'sam_and_taalis_rows': sam_and_taalis_rows,
    }), 200