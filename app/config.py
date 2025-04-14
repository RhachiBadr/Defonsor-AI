import os

class Config:
    SECRET_KEY = os.urandom(24)  # Générer une clé secrète aléatoire
    DEBUG = True
    MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'models')
    STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
    TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')