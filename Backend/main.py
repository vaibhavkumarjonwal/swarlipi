from flask import Flask
from flask_cors import CORS
from app.models.init_db import initialise_db
import os
from datetime import timedelta
from app.auth.login import login_blueprint
from app.auth.signup import signup_blueprint
from app.auth.logout import logout_blueprint
from app.auth.user import get_user_blueprint
from app.auth.upload import upload_blueprint
from app.auth.get_initial_rows import initial_rows_blueprint
from app.auth.serve_static import image_blueprint
from app.auth.update_initial_rows import update_initial_rows_blueprint
from app.auth.update_sam_taali import update_sam_taali_blueprint
from app.auth.final_rows import final_rows_blueprint
from app.auth.fetch_image import fetch_image_blueprint
from app.auth.final_save import final_save_blueprint
from app.auth.save_kern import save_kern_blueprint
from app.auth.get_segmented_data import get_segmented_data_blueprint
from app.auth.get_kern_data import get_kern_data_blueprint

app = Flask(__name__)
app.config['SECRET_KEY'] = 'swar_lipi_app_2025'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['TIMEOUT'] = 500

# CORS configuration
CORS(app,
     #origins=["http://localhost:3000", "http://127.0.0.1:3000"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     expose_headers=["Set-Cookie"],
     allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Session settings for production/development
if os.environ.get('FLASK_ENV') == 'production':
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True
else:
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Default for development
    app.config['SESSION_COOKIE_SECURE'] = False

app.config['SESSION_COOKIE_DOMAIN'] = None

# Initialize database
initialise_db()

# Register blueprints
app.register_blueprint(login_blueprint)
app.register_blueprint(signup_blueprint)
app.register_blueprint(logout_blueprint)
app.register_blueprint(get_user_blueprint)
app.register_blueprint(upload_blueprint)
app.register_blueprint(initial_rows_blueprint)
app.register_blueprint(image_blueprint)
app.register_blueprint(update_initial_rows_blueprint)
app.register_blueprint(update_sam_taali_blueprint)
app.register_blueprint(final_rows_blueprint)
app.register_blueprint(fetch_image_blueprint)
app.register_blueprint(final_save_blueprint)
app.register_blueprint(save_kern_blueprint)
app.register_blueprint(get_segmented_data_blueprint)
app.register_blueprint(get_kern_data_blueprint)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

