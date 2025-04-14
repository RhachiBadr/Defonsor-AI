import tensorflow as tf
import os
import json

class SQLInjectionModel:
    def __init__(self, tokenizer_path='models/sql_injection_tokenizer.json', model_path='models/sql_injection_model.h5'):
        try:
            # Obtenir le chemin absolu du dossier racine du projet (TESTING/)
            base_dir = os.path.dirname(os.path.abspath(__file__))
            while base_dir.endswith('app') or base_dir.endswith('models'):
                base_dir = os.path.dirname(base_dir)  # Remonter jusqu'à TESTING/
            
            # Construire les chemins complets
            full_model_path = os.path.join(base_dir, model_path)
            full_tokenizer_path = os.path.join(base_dir, tokenizer_path)
            
            # Vérifier si les fichiers existent
            if not os.path.exists(full_model_path):
                raise FileNotFoundError(f"SQL injection model file not found at {full_model_path}")
            if not os.path.exists(full_tokenizer_path):
                raise FileNotFoundError(f"Tokenizer file not found at {full_tokenizer_path}")
            
            self.model = tf.keras.models.load_model(full_model_path)
            
            # Charger le tokenizer
            with open(full_tokenizer_path, 'r') as json_file:
                tokenizer_json = json.load(json_file)
            self.tokenizer = tf.keras.preprocessing.text.Tokenizer(num_words=10000, oov_token="<unk>")
            self.tokenizer.word_index = tokenizer_json['word_index']
            self.max_len = tokenizer_json['max_len']
        except FileNotFoundError as e:
            raise FileNotFoundError(f"Model or tokenizer file not found: {e}")
        except Exception as e:
            raise Exception(f"Error loading model or tokenizer: {e}")

    def preprocess_text(self, text):
        if not text or not isinstance(text, str):
            raise ValueError("Invalid text input")
        sequences = self.tokenizer.texts_to_sequences([text])
        padded_sequences = tf.keras.preprocessing.sequence.pad_sequences(sequences, maxlen=self.max_len, padding='post')
        return padded_sequences

    def predict(self, text):
        processed_text = self.preprocess_text(text)
        prediction = self.model.predict(processed_text)[0][0]
        return bool(prediction > 0.5)  # Retourner True/False pour clarté