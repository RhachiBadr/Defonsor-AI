import os

# Obtenir le chemin absolu du dossier racine du projet (TESTING/)
base_dir = os.path.dirname(os.path.abspath(__file__))
while base_dir.endswith('app') or base_dir.endswith('models'):
    base_dir = os.path.dirname(base_dir)

# Définir les chemins complets pour tous les modèles
phishing_model_path = os.path.join(base_dir, 'models', 'phishing_detector_rf.pkl')
sql_model_path = os.path.join(base_dir, 'models', 'sql_injection_model.h5')
xss_model_path = os.path.join(base_dir, 'models', 'xss_model.h5')
xss_tokenizer_path = os.path.join(base_dir, 'models', 'xss_tokenizer.json')

# Afficher les chemins
print(f"Base directory: {base_dir}")
print(f"Phishing model path: {phishing_model_path}")
print(f"SQL model path: {sql_model_path}")
print(f"XSS model path: {xss_model_path}")
print(f"XSS tokenizer path: {xss_tokenizer_path}")

# Vérifier l'existence des fichiers
if os.path.exists(phishing_model_path):
    print("Phishing model file found!")
else:
    print("Phishing model file NOT found!")

if os.path.exists(sql_model_path):
    print("SQL model file found!")
else:
    print("SQL model file NOT found!")

if os.path.exists(xss_model_path):
    print("XSS model file found!")
else:
    print("XSS model file NOT found!")

if os.path.exists(xss_tokenizer_path):
    print("XSS tokenizer file found!")
else:
    print("XSS tokenizer file NOT found!")