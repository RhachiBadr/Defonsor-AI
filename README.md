# Defonsor-AI
Defonsor AI - XSS, SQL Injection, and Phishing Attack Detection

📜 Overview
Defonsor AI is a web application designed to automatically detect XSS (Cross-Site Scripting), SQL Injection, and Phishing attacks with high accuracy. and leverages machine learning models to analyze user inputs and identify potential threats in real-time.

🚀 Features
Attack Detection: Accurate identification of XSS (99.67% accuracy), SQL Injection, and Phishing attacks using trained CNN models.
User Interface: Intuitive web interface with tabs for analyzing text or files.
Security: Input sanitization with bleach on the server side and data escaping with escapeHTML on the client side to prevent XSS attacks.
Modular Architecture: Flask backend with separate controllers for each attack type (XSS, SQL Injection, Phishing), communicating via REST API.
User Management: Sign-up, login, and email verification, with a secure SQLite database (passwords hashed with bcrypt).

🛠️ Technologies Used
Frontend: HTML, CSS, JavaScript
Backend: Flask (Python), REST API
Machine Learning: TensorFlow, Keras (CNN models) , Random Forest
Database: SQLite
Security: bleach, bcrypt, escapeHTML
Tools: Jupyter Notebook (model training)

📊 Results
XSS Model Accuracy: 99.67% on the test set.
Response Time: Analysis in under 2 seconds.
Security: No XSS execution detected during testing.

📂 Project Structure
app/: Contains the Flask backend, controllers (xss_controller.py, etc.), and models (xss_model.py).
static/: CSS and JavaScript files (script.js) for the frontend.
templates/: HTML pages (dashboard.html, etc.).
models/: Trained models and tokenizers (xss_model.h5, xss_tokenizer.json).
data/: Datasets used for training.

⚙️ Installation
Clone the repository: git clone https://github.com/RhachiBadr/Defonsor-AI.git
Install dependencies: pip install -r requirements.txt
Run the application: python main.py
Access the interface: http://localhost:5000

📈 Future Improvements
Add detection for other attacks (e.g., CSRF).
Switch to a more robust database (e.g., PostgreSQL).
Enhance models with larger datasets.
