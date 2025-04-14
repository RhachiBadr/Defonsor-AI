# app/main.py

from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from data import db, User, send_verification_email, init_db, init_serializer
import os

# Importer les blueprints des contrôleurs
from app.controllers.xss_controller import xss_bp
from app.controllers.sql_injection_controller import sql_injection_bp
from app.controllers.phishing_controller import phishing_bp

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')

# Configuration Flask
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = '4f5d6e7a8b9c0d1e2f3a4b5c6d7e8f9a'
app.secret_key = '4f5d6e7a8b9c0d1e2f3a4b5c6d7e8f9a'

# Initialisation de la base de données et du serializer
init_db(app)
serializer = init_serializer(app.config['SECRET_KEY'])

# Enregistrer les blueprints
app.register_blueprint(xss_bp, url_prefix='/analyze')
app.register_blueprint(sql_injection_bp, url_prefix='/analyze')
app.register_blueprint(phishing_bp, url_prefix='/analyze')

# Routes existantes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/acces')
def acces():
    return render_template('acces.html')

@app.route('/thanks')
def thanks():
    return render_template('thanks.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Veuillez vous connecter pour accéder à cette page.')
        return redirect(url_for('index'))
    user = User.query.get(session['user_id'])
    return render_template('dashboard.html', user=user)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/legal')
def legal():
    return render_template('legal.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/social')
def social():
    return render_template('social.html')

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/connexion')
def connexion():
    return render_template('connexion.html')

@app.route('/inscription')
def inscription():
    return render_template('inscription.html')

@app.route('/pourquoi')
def pourquoi():
    return render_template('pourquoi.html')

# Routes d'authentification
@app.route('/signup', methods=['POST'])
def signup():
    if request.method == 'POST':
        nom = request.form.get('nom')
        prenom = request.form.get('prenom')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm-password')

        # Validation
        if not nom or not prenom or not email or not password or not confirm_password:
            return jsonify({'success': False, 'message': 'Tous les champs sont requis.'}), 400
        if password != confirm_password:
            return jsonify({'success': False, 'message': 'Les mots de passe ne correspondent pas.'}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'Cet e-mail est déjà utilisé.'}), 400

        # Ajouter l'utilisateur à la base de données
        new_user = User(nom=nom, prenom=prenom, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        # Envoyer l'e-mail de vérification
        try:
            send_verification_email(email, nom, prenom, serializer)
            return jsonify({'success': True, 'message': 'Inscription réussie ! Vérifiez votre e-mail.'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Erreur lors de l\'envoi de l\'e-mail : {e}'}), 500

@app.route('/verify/<token>')
def verify(token):
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    
    try:
        email = serializer.loads(token, salt='email-verification', max_age=3600)  # Token valide 1 heure
        user = User.query.filter_by(email=email).first()
        if user:
            if not user.verified:
                user.verified = True
                db.session.commit()
            session['user_id'] = user.id
            flash('Votre adresse e-mail a été vérifiée avec succès. Vous êtes maintenant connecté.')
            return redirect(url_for('dashboard'))
        else:
            flash('Utilisateur non trouvé.')
    except Exception as e:
        flash('Le lien de vérification est invalide ou a expiré.')
        print(f"Erreur : {e}")

    return redirect(url_for('index'))

@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            return jsonify({'success': False, 'message': 'E-mail et mot de passe sont requis.'}), 400

        user = User.query.filter_by(email=email, password=password).first()
        if user:
            if user.verified:
                session['user_id'] = user.id
                return jsonify({'success': True, 'message': 'Connexion réussie !'}), 200
            else:
                return jsonify({'success': False, 'message': 'Veuillez vérifier votre e-mail avant de vous connecter.'}), 400
        else:
            return jsonify({'success': False, 'message': 'E-mail ou mot de passe incorrect.'}), 400

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True, 'message': 'Déconnexion réussie.'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)