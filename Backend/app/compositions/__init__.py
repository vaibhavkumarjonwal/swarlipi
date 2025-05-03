from flask import Blueprint
from .create_composition import create_composition_route
from .get_compositions import get_compositions_route
from .get_composition import get_composition_route

compositions_bp = Blueprint('compositions', __name__)

create_composition_route(compositions_bp)
get_compositions_route(compositions_bp)
get_composition_route(compositions_bp)