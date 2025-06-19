from flask import jsonify, Blueprint

health_check_blueprint = Blueprint('health_check', __name__)

@health_check_blueprint.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify backend is running and accessible
    """
    return jsonify({
        'status': 'healthy',
        'message': 'Backend is running successfully',
        'service': 'SwarLipi Backend',
        'version': '1.0.0'
    }), 200

@health_check_blueprint.route('/config-check', methods=['GET'])
def config_check():
    """
    Configuration check endpoint to help diagnose connectivity issues
    """
    import os
    return jsonify({
        'status': 'ok',
        'environment': os.environ.get('FLASK_ENV', 'development'),
        'cors_enabled': True,
        'allowed_origins': ['http://localhost:3000', 'http://164.52.205.176:3000'],
        'backend_url': 'http://164.52.205.176:5000',
        'message': 'Configuration check passed'
    }), 200