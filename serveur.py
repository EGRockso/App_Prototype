
# pip install flask scikit-learn joblib
from flask import Flask, request, jsonify
import joblib
import numpy as np

# Path to your saved global model (adjust if needed)
MODEL_PATH = "models_sgd/global_sgd_tuned.joblib"

app = Flask(__name__)
model = joblib.load(MODEL_PATH)

# Features expected: must match training pipeline order!
FEATURES = [
    "nr. sessions","nr. rest days","total kms","max km one day","total km Z3-Z4-Z5-T1-T2",
    "nr. tough sessions (effort in Z5, T1 or T2)","nr. days with interval session",
    "total km Z3-4","max km Z3-4 one day","total km Z5-T1-T2","max km Z5-T1-T2 one day",
    "total hours alternative training","nr. strength trainings","avg exertion","min exertion","max exertion",
    "avg training success","min training success","max training success","avg recovery","min recovery","max recovery",
    # (and if you trained with lagged .1/.2 features, include them here in the same order)
    "rel total kms week 0_1","rel total kms week 0_2","rel total kms week 1_2"
]

@app.post("/predict")
def predict():
    js = request.get_json(force=True)
    X = np.array([[js.get(feat, 0.0) for feat in FEATURES]], dtype=float)
    proba = float(model.predict_proba(X)[0,1])
    label = int(proba >= 0.5)
    return jsonify({"predicted_probability": round(proba,4), "predicted_label": label})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
