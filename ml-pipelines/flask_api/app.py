from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os

app = Flask(__name__)

# Production CORS: restrict origins via environment variable
allowed_origins = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
if allowed_origins == ['*']:
    CORS(app)
else:
    CORS(app, origins=allowed_origins)

# Load all models at startup
MODEL_DIR = os.environ.get('MODEL_DIR', os.path.join(os.path.dirname(__file__), '..', 'models'))
models = {}
model_files = {
    'donor-churn': 'donor_churn.pkl',
    'social-media': 'social_media.pkl',
    'reintegration': 'reintegration.pkl',
    'counseling': 'counseling.pkl',
    'incident-risk': 'incident_risk.pkl',
    'education-outcome': 'education_outcome.pkl',
    'donation-forecast': 'donation_forecast.pkl',
    'safehouse-outcomes': 'safehouse_outcomes.pkl',
}

for name, filename in model_files.items():
    path = os.path.join(MODEL_DIR, filename)
    if os.path.exists(path):
        models[name] = joblib.load(path)
        print(f"Loaded model: {name}")
    else:
        print(f"WARNING: Model file not found: {path}")


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'models_loaded': list(models.keys()),
        'models_missing': [n for n in model_files if n not in models]
    })


@app.route('/predict/<model_name>', methods=['POST'])
def predict(model_name):
    if model_name not in models:
        return jsonify({
            'error': f'Model {model_name} not found',
            'available': list(models.keys())
        }), 404

    try:
        data = request.get_json()
        if not data or 'features' not in data:
            return jsonify({'error': 'Request must include "features" object'}), 400

        df = pd.DataFrame([data['features']])
        model = models[model_name]
        prediction = model.predict(df)

        result = {
            'model': model_name,
            'prediction': prediction.tolist()
        }

        # Add probabilities for classifiers
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(df)
            result['probabilities'] = proba.tolist()
            # For binary classifiers, add a risk_level label
            if proba.shape[1] == 2:
                prob_positive = float(proba[0][1])
                if prob_positive >= 0.7:
                    result['risk_level'] = 'High'
                elif prob_positive >= 0.4:
                    result['risk_level'] = 'Medium'
                else:
                    result['risk_level'] = 'Low'

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
