from collections import OrderedDict
from flask import Blueprint, request, jsonify, session
import os

from app.services.generators import generate_kern, generate_metadata_header, generate_transition
from app.services.identifications import calculate_divisions_and_vibhaag
from app.services.modifications import categorize_flatten_predictions
from app.services.save_and_load import get_metadata_field, get_taal_field, load_categorized_flatten_predictions, load_predictions, load_row_categories, save_categorized_flatten_predictions
from app.services.save_data import load_rows_from_file, save_rows_to_file
from app.services.clean import clean_swar
from app.services.user_changes import count_nested_changes

final_save_blueprint = Blueprint('final_save', __name__)

kern_data_store = None

@final_save_blueprint.route('/final_save', methods=['POST'])
def final_save():
    print("################################ FINAL DATA ################################")
    data = request.get_json()
    print("data", data)
    global kern_data_store
    #load old data
    # predictions = load_rows_from_file("predicitons")
    print(" PREDICITONS LOADED")
    predictions = data["predictions"]['predictions']
    print(predictions)


    sorted_predictions = OrderedDict(
        sorted(
            predictions.items(),
            key=lambda item: int(item[0].split('_')[1])
        )
    )   
    data["predictions"] = sorted_predictions
    predictions = clean_swar(data["predictions"])

    original_pred_file = load_rows_from_file("predictions")
    total = count_nested_changes(original_pred_file, predictions)
    print(f"Total changes in predictions: {total}")

    change_logs = load_rows_from_file("change_logs")
    change_logs['total_prediction_changes'] = total
    save_rows_to_file(change_logs, "change_logs")
    
    save_rows_to_file(predictions, "predictions")
    # predictions = data["predictions"]

    predictions = load_rows_from_file("predictions")
    row_categories = load_row_categories()


    categorized_flatten = categorize_flatten_predictions(predictions, row_categories)
    save_categorized_flatten_predictions(categorized_flatten)
    
    raag = get_metadata_field(field='raag_name')
    taal = get_metadata_field(field='taal_name')
    lay = get_metadata_field(field='lay')
    metadata_header_text, metadata_header_kern = generate_metadata_header(raag, taal, lay)



    taal = get_metadata_field(field='taal_name')
    sthayee_sam_beat = get_metadata_field(field='sthayee.sam_beat')
    if sthayee_sam_beat is not None:


    # Calculate divisions and vibhaag for sthayee
        sthayee_division, sthayee_vibhaag = calculate_divisions_and_vibhaag(taal, sthayee_sam_beat)

    # Number of beats in one cycle of given taal
        beat_count = get_taal_field(taal, field_name="beat_count")

        sthayee_predictions = load_categorized_flatten_predictions("sthayee")
        print("sthayee_predictions", sthayee_predictions)
        sthayee_meend = sthayee_predictions["meend"]
        sthayee_kann_swar = sthayee_predictions["kann_swar"]
        sthayee_swar = sthayee_predictions["swar"]

        sthayee_kern_text, sthayee_kern = generate_kern(sthayee_meend, sthayee_kann_swar, sthayee_swar, sthayee_division, beat_count)

        sthayee_header = "!! Sthayee"


    antara_sam_beat = get_metadata_field(field='antara.sam_beat')
    if antara_sam_beat is not None:

        # Calculate divisions and vibhaag for antara
        antara_division, antara_vibhaag = calculate_divisions_and_vibhaag(taal, antara_sam_beat)

        # Generate transition from sthayee to antara
        sthayee_antara_transition_text, sthayee_antara_transition_kern = generate_transition(sthayee_kern, sthayee_vibhaag, antara_vibhaag)

        sthayee_antara_transition_header = "!! Sthayee to Antara Transition"

    if antara_sam_beat is not None:

        antara_predictions = load_categorized_flatten_predictions("antara")

        antara_meend = antara_predictions["meend"]
        antara_kann_swar = antara_predictions["kann_swar"]
        antara_swar = antara_predictions["swar"]

        antara_kern_text, antara_kern = generate_kern(antara_meend, antara_kann_swar, antara_swar, antara_division, beat_count)

        antara_header = "!! Antara"

    sanchari_sam_beat = get_metadata_field(field='sanchari.sam_beat')

    if sanchari_sam_beat is not None:

        # Calculate divisions and vibhaag for sanchari
        sanchari_division, sanchari_vibhaag = calculate_divisions_and_vibhaag(taal, sanchari_sam_beat)

        # Generate transition from sthayee to antara
        antara_sanchari_transition_text, antara_sanchari_transition_kern = generate_transition(antara_kern, antara_vibhaag, sanchari_vibhaag)

        antara_sanchari_transition_header = "!! Antara to Sanchari Transition"

    if sanchari_sam_beat is not None:

        sanchari_predictions = load_categorized_flatten_predictions("sanchari")

        sanchari_meend = sanchari_predictions["meend"]
        sanchari_kann_swar = sanchari_predictions["kann_swar"]
        sanchari_swar = sanchari_predictions["swar"]

        sanchari_kern_text, sanchari_kern = generate_kern(sanchari_meend, sanchari_kann_swar, sanchari_swar, sanchari_division, beat_count)

        sanchari_header = "!! Sanchari"

    

    aabhog_sam_beat = get_metadata_field(field='aabhog.sam_beat')

    if aabhog_sam_beat is not None:

        # Calculate divisions and vibhaag for sanchari
        aabhog_division, aabhog_vibhaag = calculate_divisions_and_vibhaag(taal, aabhog_sam_beat)

        # Generate transition from sthayee to antara
        sanchari_aabhog_transition_text, sanchari_aabhog_transition_kern = generate_transition(sanchari_kern, sanchari_vibhaag, aabhog_vibhaag)

        sanchari_aabhog_transition_header = "!! Sanchari to Aabhog Transition"

    if aabhog_sam_beat is not None:

        aabhog_predictions = load_categorized_flatten_predictions("aabhog")

        aabhog_meend = aabhog_predictions["meend"]
        aabhog_kann_swar = aabhog_predictions["kann_swar"]
        aabhog_swar = aabhog_predictions["swar"]

        aabhog_kern_text, aabhog_kern = generate_kern(aabhog_meend, aabhog_kann_swar, aabhog_swar, aabhog_division, beat_count)

        aabhog_header = "!! Aabhog"

    print(metadata_header_text)

    if sthayee_sam_beat:
        print(sthayee_header)
        print(sthayee_kern_text)

    if antara_sam_beat:
        print(sthayee_antara_transition_header)
        print(sthayee_antara_transition_text)

        print(antara_header)
        print(antara_kern_text)

    if sanchari_sam_beat:

        print(antara_sanchari_transition_header)
        print(antara_sanchari_transition_text)

        print(sanchari_header)
        print(sanchari_kern_text)

    if aabhog_sam_beat:

        print(sanchari_aabhog_transition_header)
        print(sanchari_aabhog_transition_text)

        print(aabhog_header)
        print(aabhog_kern_text)

    response_data = {
        "message": "Final data saved successfully!",
        "kern_data": {
            "metadata": {
                "header_text": metadata_header_text,
                "header_kern": metadata_header_kern
            },
            "sections": []
        }
    }
    
    # Add sthayee section
    if sthayee_sam_beat:
        response_data["kern_data"]["sections"].append({
            "type": "sthayee",
            "header": sthayee_header,
            "text": sthayee_kern_text,
            "kern": sthayee_kern
        })
    
    # Add transition and antara section if available
    if antara_sam_beat:
        response_data["kern_data"]["sections"].append({
            "type": "sthayee_antara_transition",
            "header": sthayee_antara_transition_header,
            "text": sthayee_antara_transition_text,
            "kern": sthayee_antara_transition_kern
        })
        
        response_data["kern_data"]["sections"].append({
            "type": "antara",
            "header": antara_header,
            "text": antara_kern_text,
            "kern": antara_kern
        })
    
    # Add sanchari section if available
    if sanchari_sam_beat:
        response_data["kern_data"]["sections"].append({
            "type": "antara_sanchari_transition",
            "header": antara_sanchari_transition_header,
            "text": antara_sanchari_transition_text,
            "kern": antara_sanchari_transition_kern
        })
        
        response_data["kern_data"]["sections"].append({
            "type": "sanchari",
            "header": sanchari_header,
            "text": sanchari_kern_text,
            "kern": sanchari_kern
        })
    
    # Add aabhog section if available
    if aabhog_sam_beat:
        response_data["kern_data"]["sections"].append({
            "type": "sanchari_aabhog_transition",
            "header": sanchari_aabhog_transition_header,
            "text": sanchari_aabhog_transition_text,
            "kern": sanchari_aabhog_transition_kern
        })
        
        response_data["kern_data"]["sections"].append({
            "type": "aabhog",
            "header": aabhog_header,
            "text": aabhog_kern_text,
            "kern": aabhog_kern
        })
    
    kern_data_store = response_data
    return jsonify(response_data), 200


