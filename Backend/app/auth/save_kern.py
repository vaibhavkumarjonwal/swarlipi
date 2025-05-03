# from collections import OrderedDict
# from flask import Blueprint, request, jsonify, session
# import os

# save_kern_blueprint = Blueprint('save_kern', __name__)


# @save_kern_blueprint.route('/save_kern', methods=['POST'])
# def save_kern():
#     try:
#         data = request.get_json()
#         kern_data = data.get('kern_data')
        
#         if not kern_data:
#             return jsonify({"error": "No kern data provided"}), 400
        
#         # Create the directory for storing kern files if it doesn't exist
#         kern_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'kern')
#         os.makedirs(kern_dir, exist_ok=True)
        
#         # Save the metadata header
#         metadata_text = kern_data['metadata']['header_text']
#         with open(os.path.join(kern_dir, 'metadata_header.txt'), 'w') as f:
#             f.write(metadata_text)

        
#         # Save the complete kern file
#         complete_kern = metadata_text + '\n\n'
#         for section in kern_data['sections']:
#             complete_kern += section['header'] + '\n'
#             complete_kern += section['text'] + '\n\n'
        
#         with open(os.path.join(kern_dir, 'complete_kern.txt'), 'w') as f:
#             f.write(complete_kern)
        
#         return jsonify({
#             "message": "Kern data saved successfully",
#             "files": {
#                 "metadata": "metadata_header.txt",
#                 "complete": "complete_kern.txt",
#                 "sections": [f"{section['type']}.txt" for section in kern_data['sections']]
#             }
#         }), 200
    
#     except Exception as e:
#         print(f"Error saving kern data: {str(e)}")
#         return jsonify({"error": f"Failed to save kern data: {str(e)}"}), 500



from collections import OrderedDict
import shutil
from flask import Blueprint, request, jsonify, session
import os
import psycopg2
from psycopg2.extras import execute_values
import json
import re

from app.services.save_data import load_rows_from_file
from ..db import get_db_connection
from ..config import PATHS

save_kern_blueprint = Blueprint('save_kern', __name__)

@save_kern_blueprint.route('/save_kern', methods=['POST'])
def save_kern():
    dir = PATHS['initial_segmentation']
    for file in os.listdir(dir):
        file_path = os.path.join(dir, file)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)  # remove file or symlink
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path) 
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')
    try:
        # Get the request data
        data = request.get_json()
        print("Received data:", data)
        if not data:
            return jsonify({"error": "No data provided in request"}), 400
            
        # Extract kern_data from the response format
        kern_data = data.get('kern_data')
        if not kern_data:
            return jsonify({"error": "No kern_data provided in the request"}), 400
        
        # Get username from session or request
        print(session.keys())
        username = session.get('username') or data.get('username')
        print("Username from session or request:", username)
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        # Extract metadata for the compositions table
        metadata = kern_data.get('metadata', {})
        header_text = metadata.get('header_text', '')
        
        # Extract raag, taal, lay from metadata header using regex
        raag_match = re.search(r'!!!raag:\s*(.+)', header_text)
        taal_match = re.search(r'!!!taal:\s*(.+)', header_text)
        lay_match = re.search(r'!!!lay:\s*(.+)', header_text)
        source_match = re.search(r'!!!source:\s*(.+)', header_text)
        page_match = re.search(r'!!!page:\s*(\d+)', header_text)
        
        raag_name = raag_match.group(1).strip() if raag_match else ''
        taal_name = taal_match.group(1).strip() if taal_match else ''
        lay = lay_match.group(1).strip() if lay_match else ''
        source_name = source_match.group(1).strip() if source_match else ''
        source_page = int(page_match.group(1)) if page_match else None
        
        # Connect to PostgreSQL database
        conn = get_db_connection()

        cursor = conn.cursor()
        print("Connected to the database")
        
        # 1. Insert into compositions table
        cursor.execute(
            """
            INSERT INTO compositions (username, raag_name, taal_name, lay, source_name, source_page)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (username, raag_name, taal_name, lay, source_name, source_page)
        )
        composition_id = cursor.fetchone()[0]
        
        # 2. Process and insert global header
        header_lines = header_text.strip().split('\n')
        cursor.execute(
            """
            INSERT INTO kern_headers (composition_id, global_header)
            VALUES (%s, %s)
            """,
            (composition_id, header_lines)
        )
        
        # 3. Process and insert sections
        section_order = 1
        for section in kern_data.get('sections', []):
            section_type = section.get('type')
            section_header = section.get('header')
            section_text = section.get('text', '').strip().split('\n')
            
            # Validate section_type against the ENUM values
            valid_types = [
                'sthayee', 'sthayee_antara_transition', 'antara', 
                'antara_sanchari_transition', 'sanchari', 
                'sanchari_aabhog_transition', 'aabhog'
            ]
            
            if section_type not in valid_types:
                print(f"Warning: Skipping section with invalid type: {section_type}")
                continue
                
            cursor.execute(
                """
                INSERT INTO kern_sections 
                (composition_id, section_type, section_header, kern_data, sequence_order)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (composition_id, section_type, section_header, section_text, section_order)
            )
            section_order += 1

        # 4. Insert into composition_change_stats
        change_logs = load_rows_from_file("change_logs")
        total_sam_taali_changes = change_logs.get('total_sam_taali_changes', 0)
        total_row_changes = change_logs.get('total_row_changes', 0)
        total_prediction_changes = change_logs.get('total_prediction_changes', 0)

        cursor.execute(
            """
            INSERT INTO change_logs (
                username, total_sam_taali_changes, total_row_changes, total_prediction_changes
            ) VALUES (%s, %s, %s, %s)
            """,
            (username, total_sam_taali_changes, total_row_changes, total_prediction_changes)
        )

        
        # Commit the transaction
        conn.commit()
        
        return jsonify({
            "message": "Kern data saved successfully to database",
            "composition_id": composition_id
        }), 200
    
    except Exception as e:
        # Rollback in case of error
        if 'conn' in locals() and conn:
            conn.rollback()
        
        print(f"Error saving kern data: {str(e)}")
        return jsonify({"error": f"Failed to save kern data: {str(e)}"}), 500
    
    finally:
        # Close database connection
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()