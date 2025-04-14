# controllers/sql_injection_controller.py

from flask import Blueprint, request, jsonify
from app.models.sql_injection_model import SQLInjectionModel

sql_injection_bp = Blueprint('sql_injection', __name__)

@sql_injection_bp.route('/sql_injection/analyze', methods=['POST'])
def analyze_sql_injection():
    try:
        data = request.get_json()
        text = data.get('text')
        if not text:
            return jsonify({"error": "Text input is missing"}), 400

        sql_injection_model = SQLInjectionModel()
        # Obtenir la probabilité brute
        processed_text = sql_injection_model.preprocess_text(text)
        probability = sql_injection_model.model.predict(processed_text)[0][0]
        # Déterminer le label
        label = "SQL Injection" if probability > 0.5 else "Non-SQL Injection"
        # Retourner le label et la probabilité
        return jsonify({"label": label, "confidence": float(probability)})

    except FileNotFoundError:
        return jsonify({"error": "SQL injection model file not found"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500