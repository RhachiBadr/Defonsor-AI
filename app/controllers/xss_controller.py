# controllers/xss_controller.py

from flask import Blueprint, request, jsonify
from app.models.xss_model import XSSModel

xss_bp = Blueprint('xss', __name__)

@xss_bp.route('/xss/analyze', methods=['POST'])
def analyze_xss():
    try:
        data = request.get_json()
        text = data.get('text')
        if not text:
            return jsonify({"error": "Text input is missing"}), 400

        xss_model = XSSModel()
        # Obtenir la probabilité brute
        processed_text = xss_model.preprocess_text(text)
        probability = xss_model.model.predict(processed_text)[0][0]
        # Déterminer le label
        label = "XSS" if probability > 0.5 else "Non-XSS"
        # Retourner le label et la probabilité
        return jsonify({"xss": label, "confidence": float(probability)})

    except FileNotFoundError:
        return jsonify({"error": "XSS model file not found"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500