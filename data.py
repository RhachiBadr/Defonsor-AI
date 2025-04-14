# app/data.py

from flask_sqlalchemy import SQLAlchemy
from itsdangerous import URLSafeTimedSerializer
import yagmail

# Initialisation de SQLAlchemy (sera configuré avec l'app dans main.py)
db = SQLAlchemy()

# Fonction pour initialiser le serializer
def init_serializer(secret_key):
    return URLSafeTimedSerializer(secret_key)

# Modèle User pour la table des utilisateurs
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    verified = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<User {self.nom} {self.prenom}, Email: {self.email}, Verified: {self.verified}>"

# Fonction pour envoyer un e-mail de vérification
def send_verification_email(email, nom, prenom, serializer):
    token = serializer.dumps(email, salt='email-verification')
    verification_link = f"http://localhost:5000/verify/{token}"

    sender_email = 'badrgloo@yahoo.com'
    sender_password = 'ghfdsimxdijbxhgq'  # Remplacez par une variable d'environnement en production

    yag = yagmail.SMTP(sender_email, sender_password, host='smtp.mail.yahoo.com', port=465)

    subject = 'Vérifiez votre adresse e-mail'
    body = f'''
    Bonjour {prenom} {nom},

    Merci de vous être inscrit sur Defonsor AI.
    Veuillez cliquer sur le lien suivant pour vérifier votre adresse e-mail :

    {verification_link}

    Cordialement,
    L'équipe Defonsor AI
    '''
    
    try:
        yag.send(to=email, subject=subject, contents=body)
        print(f"E-mail envoyé avec succès à {email}.")
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'e-mail : {e}")
        raise

# Initialisation de la base de données
def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()  