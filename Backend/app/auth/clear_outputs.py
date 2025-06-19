from flask import Blueprint, jsonify
import os
import shutil
from app.config import PATHS

clear_outputs_blueprint = Blueprint('clear_outputs', __name__)

@clear_outputs_blueprint.route('/clear_outputs', methods=['POST'])
def clear_outputs():
    """
    Clear all files in the outputs folder to prepare for a new composition
    """
    try:
        outputs_folder = PATHS['initial_segmentation']
        
        # Check if outputs folder exists
        if os.path.exists(outputs_folder):
            # Remove all files in the outputs folder
            for filename in os.listdir(outputs_folder):
                file_path = os.path.join(outputs_folder, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    print(f'Failed to delete {file_path}. Reason: {e}')
            
            return jsonify({
                'message': 'Outputs folder cleared successfully',
                'status': 'success'
            }), 200
        else:
            # Create the outputs folder if it doesn't exist
            os.makedirs(outputs_folder, exist_ok=True)
            return jsonify({
                'message': 'Outputs folder created and ready',
                'status': 'success'
            }), 200
            
    except Exception as e:
        return jsonify({
            'error': f'Failed to clear outputs folder: {str(e)}',
            'status': 'error'
        }), 500
