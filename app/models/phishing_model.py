import joblib
import pandas as pd
import tldextract
import re
from urllib.parse import urlparse
import os
import sklearn  # Ajout explicite pour vérifier si scikit-learn est bien importé

class PhishingModel:
    def __init__(self, model_path='models/phishing_detector_rf.pkl', encoder_path='models/label_encoder.pkl'):
        try:
            # Obtenir le chemin absolu du dossier racine du projet (TESTING/)
            base_dir = os.path.dirname(os.path.abspath(__file__))
            while base_dir.endswith('app') or base_dir.endswith('models'):
                base_dir = os.path.dirname(base_dir)  # Remonter jusqu'à TESTING/
            
            # Construire les chemins complets
            full_model_path = os.path.join(base_dir, model_path)
            full_encoder_path = os.path.join(base_dir, encoder_path)
            
            # Vérifier si les fichiers existent
            if not os.path.exists(full_model_path):
                raise FileNotFoundError(f"Phishing model file not found at {full_model_path}")
            if not os.path.exists(full_encoder_path):
                raise FileNotFoundError(f"Label encoder file not found at {full_encoder_path}")
            
            self.model = joblib.load(full_model_path)
            self.encoder = joblib.load(full_encoder_path)
        except FileNotFoundError as e:
            raise FileNotFoundError(f"Model file not found: {e}")
        except Exception as e:
            raise Exception(f"Error loading model: {e}")

    def predict(self, url):
        if not url or not re.match(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', url):
            raise ValueError("Invalid URL format")
        
        features = self.extract_features(url)
        features_df = pd.DataFrame([features])
        prediction = self.model.predict(features_df)[0]
        return self.encoder.inverse_transform([prediction])[0]

    def extract_features(self, url):
        ext = tldextract.extract(url)
        parsed_url = urlparse(url)
        hostname = parsed_url.hostname or ''
        path = parsed_url.path or ''
        features = {
            'url_length': len(url),
            'has_https': 1 if url.startswith('https://') else 0,
            'has_http': 1 if url.startswith('http://') else 0,
            'num_special_chars': sum(c in ['@', '?', '=', '.', '-', '_', '/', '%'] for c in url),
            'domain_length': len(ext.domain),
            'num_subdomains': ext.subdomain.count('.') + 1 if ext.subdomain else 0,
            'is_ip': 1 if any(char.isdigit() for char in ext.domain) else 0,
            'redirects': url.count('//'),
            'shortened': 1 if any(s in url.lower() for s in ['bit.ly', 'goo.gl', 'tinyurl']) else 0
        }
        return features

