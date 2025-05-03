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
CORS(app, 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Set-Cookie"],
     allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])


if app.debug:
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False
else:
    # Production settings
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_DOMAIN'] = None 

initialise_db()
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['TIMEOUT'] = 500

app.register_blueprint(login_blueprint, supports_credentials=True)
app.register_blueprint(signup_blueprint, supports_credentials=True)    
app.register_blueprint(logout_blueprint, supports_credentials=True)
app.register_blueprint(get_user_blueprint, supports_credentials=True)
app.register_blueprint(upload_blueprint, supports_credentials=True)
app.register_blueprint(initial_rows_blueprint, supports_credentials=True)
app.register_blueprint(image_blueprint, supports_credentials=True)
app.register_blueprint(update_initial_rows_blueprint, supports_credentials=True)
app.register_blueprint(update_sam_taali_blueprint, supports_credentials=True)
app.register_blueprint(final_rows_blueprint, supports_credentials=True)
app.register_blueprint(fetch_image_blueprint, supports_credentials=True)
app.register_blueprint(final_save_blueprint, supports_credentials=True)
app.register_blueprint(save_kern_blueprint, supports_credentials=True)
app.register_blueprint(get_segmented_data_blueprint, supports_credentials=True)
app.register_blueprint(get_kern_data_blueprint, supports_credentials=True)

if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 5000, debug=True)