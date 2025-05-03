from collections import defaultdict
from flask import Blueprint, request, jsonify, session
import os

from app.services.generators import generate_lists_in_subgroups, generate_predictions, update_kann_swar_and_generate_meend_lists
from app.services.modifications import finalize_segmentation_and_lists
from app.services.save_and_load import get_taal_field, load_lists_in_subgroups, load_row_categories, save_lists_in_subgroups, save_predictions, save_row_categories, update_composition_metadata
from app.services.save_data import load_rows_from_file, save_rows_to_file
from app.services.filename_utils import get_image_details_with_path
from app.services.user_changes import user_changes
from ..config import PATHS

final_rows_blueprint = Blueprint('final_rows', __name__)


segmented_data_store = None

@final_rows_blueprint.route('/final_rows', methods=['POST'])
def final_rows():
    global segmented_data_store
    data = request.get_json()
    if not data:
            return jsonify({"error": "No data received"}), 400  
    metadata = load_rows_from_file("composition_metadata")
    row_categories = load_row_categories()

    total = 0
    total += user_changes(row_categories['articulation'], data['articulation'])
    total += user_changes(row_categories['kann_swar'], data['kann_swar'])
    total += user_changes(row_categories['swar'], data['swar'])
    total += user_changes(row_categories['lyrics'], data['lyrics'])

    print(f"Total changes in articulation, kann_swar, swar, lyrics: {total}")

    change_logs = load_rows_from_file("change_logs")
    change_logs['total_row_changes'] = total
    save_rows_to_file(change_logs, "change_logs")
    
    print(data)
    rowsss = {}
    rowsss['articulation'] = data['articulation']
    rowsss['kann_swar'] = data['kann_swar']
    rowsss['swar'] = data['swar']
    rowsss['lyrics'] = data['lyrics']
    

    section_beats = {}
    if 'Sthayee' in data and data['Sthayee']:
        info = data['Sthayee'][0]
        row = info["row"]
        sam_beat = info["sam_beat"]
        rowsss['sthayee'] = row
        section_beats['sthayee_sam_beat']= sam_beat
    if 'Antara' in data and data['Antara']:
        info = data['Antara'][0]
        row = info["row"]
        sam_beat = info["sam_beat"]
        rowsss['antara'] = row
        section_beats['antara_sam_beat']= sam_beat
    if 'Sanchari' in data and data['Sanchari']:
        info = data['Sanchari'][0]
        row = info["row"]
        sam_beat = info["sam_beat"]
        rowsss['sanchari'] = row
        section_beats['sanchari_sam_beat']= sam_beat
    if 'Aabhog' in data and data['Aabhog']:
        info = data['Aabhog'][0]
        row = info["row"]
        sam_beat = info["sam_beat"]
        rowsss['aabhog'] = row
        section_beats['aabhog_sam_beat']= sam_beat

    if section_beats:
        update_composition_metadata(**section_beats)

    save_row_categories(rowsss)
    print(rowsss)

    section_beats = {}
    


    working_composition_folder = PATHS['working_composition']
    image_files = os.listdir(working_composition_folder)
    image_info = [get_image_details_with_path(f, working_composition_folder) for f in image_files]
    image_info = [info for info in image_info if info is not None]

    # Organize images by row and column
    row_col_images = defaultdict(lambda: defaultdict(list))
    for info in image_info:
        page_num, row_num, col_num, x, y, width, height, image_path = info
        row_col_images[row_num][col_num].append((x, y, width, height, image_path))
    
    # get beat count for given taal

    taal = metadata['taal_name']
    beat_count = get_taal_field(taal, field_name="beat_count")

    subgroup_ranges = load_rows_from_file("subgroup_ranges")
    subgroup_ranges = [tuple(lst) for lst in subgroup_ranges]
    print("Subgroup Ranges:", subgroup_ranges)
    subgroups = generate_lists_in_subgroups(subgroup_ranges, row_col_images, beat_count)
    save_lists_in_subgroups(subgroups)
    
    subgroups = load_lists_in_subgroups()
    update_kann_swar_and_generate_meend_lists()

    subgroups = load_lists_in_subgroups()
    finalize_segmentation_and_lists()

    subgroups = load_lists_in_subgroups()
    predicted_results = generate_predictions(subgroups)
    print("Predicted Results:", predicted_results)
    save_predictions(predicted_results)

    pred = load_rows_from_file("predictions")
    subgrp = load_rows_from_file("subgroups")
    row_paths = data['row_paths']



    segmented_data_store = {
            'predictions': pred,
            'subgroups': subgrp,
            'row_paths': row_paths
        }
    print("Row Paths:", row_paths)
    return jsonify({
        "predictions": pred,
        "subgroups": subgrp,
        "row_paths": row_paths,
    }), 200



