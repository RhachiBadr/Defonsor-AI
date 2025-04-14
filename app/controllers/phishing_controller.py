# controllers/phishing_controller.py

from flask import Blueprint, request, jsonify
import re
import pandas as pd

phishing_bp = Blueprint('phishing', __name__)
from app.models.phishing_model import PhishingModel

@phishing_bp.route('/phishing/analyze', methods=['POST'])
def analyze_phishing():
    try:
        data = request.get_json()
        url = data.get('url')
        if not url:
            return jsonify({"error": "Input is required"}), 400

        # Vérifiez si c'est une URL ou un autre type de texte
        if re.match(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', url):
            phishing_model = PhishingModel()
            # Obtenir la prédiction et la probabilité
            features = phishing_model.extract_features(url)
            features_df = pd.DataFrame([features])
            prediction = phishing_model.model.predict(features_df)[0]
            probability = phishing_model.model.predict_proba(features_df)[0][prediction]
            # Convertir le label "Good"/"Bad" en "Phishing"/"Non-Phishing"
            label = "Phishing" if phishing_model.encoder.inverse_transform([prediction])[0] == "Bad" else "Non-Phishing"
            return jsonify({"phishing": label, "confidence": float(probability)})
        else:
            # Si ce n'est pas une URL, renvoyer une erreur
            return jsonify({"error": "Input must be a valid URL"}), 400

    except FileNotFoundError:
        return jsonify({"error": "Phishing model file not found"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
