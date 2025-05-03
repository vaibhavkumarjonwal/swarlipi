from flask import json, request, jsonify, session, Blueprint
import os

from app.services.identifications import classify_rows_in_subgroups
from app.services.save_and_load import save_row_categories
from app.services.user_changes import user_changes
from ..config import PATHS

from app.services.save_data import load_rows_from_file, save_rows_to_file
from app.services.mapping import assign_column_numbers
from app.services.modifications import update_subgroups

update_sam_taali_blueprint = Blueprint('update_sam_taali', __name__)

@update_sam_taali_blueprint.route('/update_sam_taali', methods=['POST'])
def update_sam_taali():
    data = request.get_json()
    original_sam_taali = load_rows_from_file("sam_and_taalis_rows")

    total_changes = user_changes(original_sam_taali, data['sam_and_taalis_rows'])

    change_logs = {
    'total_sam_taali_changes': 0,
    'total_row_changes': 0,
    'total_prediction_changes': 0
    }
    change_logs['total_sam_taali_changes'] = total_changes

    print(f"Total changes in sam and taal rows: {total_changes}")
    save_rows_to_file(change_logs, "change_logs")

    metadata = load_rows_from_file("composition_metadata")
    row_mappings = load_rows_from_file("row_mapping")
    rows = {}
    rows['sam_and_taalis_rows'] = data['sam_and_taalis_rows']
    save_rows_to_file(rows, "rows")

    section_fields = {
        'sthayee': 'Sthayee_sam_beat',
        'antara': 'Antara_sam_beat',
        'sanchari': 'Sanchari_sam_beat',
        'aabhog': 'Aabhog_sam_beat'
    }

    for section, sam_key in section_fields.items():
        sam_beat = data.get(sam_key)
        if sam_beat is not None:
            metadata[section] = {'sam_beat': sam_beat}

    row_mappings = load_rows_from_file("row_mapping")
    first_row = metadata['first_row']
    sam_and_taalis_rows = data['sam_and_taalis_rows']
    # print("First Row:", sam_and_taalis_rows)
    subgroup_ranges = assign_column_numbers(row_mappings, first_row, sam_and_taalis_rows)
    updated_subgroups = update_subgroups(subgroup_ranges)

    for start, end in updated_subgroups:
        print(f"Updated Subgroup range: [{start}, {end}]")
    subgroup_ranges = updated_subgroups

    #saving subgroup ranges
    with open('subgroup_ranges.json', 'w') as f:
        json.dump(subgroup_ranges, f, indent=4)
    row_categories = classify_rows_in_subgroups(subgroup_ranges)
    
    #saving row 
    save_row_categories(row_categories)
    return jsonify({
        "row_categories": row_categories,
    }), 200
