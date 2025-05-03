from flask import session, jsonify, Blueprint

logout_blueprint = Blueprint('logout', __name__)

@logout_blueprint.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({"message": "Logout successful"}), 200