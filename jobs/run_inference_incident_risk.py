"""
Inference: Incident Risk
Loads trained model, predicts incident risk for all residents,
writes predictions to `incident_risk_predictions` table in PostgreSQL.
"""
import os, joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    model_path = os.path.join(ARTIFACTS_DIR, "incident_risk.sav")
    pipe = joblib.load(model_path)

    df = pd.read_sql("SELECT * FROM ml_incident_risk_features", engine)
    if df.empty:
        print("No feature data. Skipping inference.")
        return

    numeric_features = ["is_pwd", "has_special_needs", "sub_cat_physical_abuse",
                        "sub_cat_sexual_abuse", "sub_cat_trafficked", "sub_cat_at_risk",
                        "avg_health_score", "avg_sleep", "session_count",
                        "concerns_flagged_total", "length_of_stay_days"]
    categorical_features = ["case_status", "sex", "case_category",
                            "initial_risk_level", "current_risk_level"]

    avail_num = [c for c in numeric_features if c in df.columns]
    avail_cat = [c for c in categorical_features if c in df.columns]

    for col in avail_cat:
        df[col] = df[col].fillna("Unknown")

    X = df[avail_num + avail_cat]

    predictions = pipe.predict(X)
    probabilities = pipe.predict_proba(X)

    results = pd.DataFrame({
        "resident_id": df["resident_id"].astype(int),
        "risk_probability": probabilities[:, 1].round(4),
        "risk_prediction": predictions.astype(int),
        "risk_level": pd.cut(
            probabilities[:, 1],
            bins=[-0.01, 0.3, 0.6, 1.01],
            labels=["Low", "Medium", "High"],
        ).astype(str),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    })

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS incident_risk_predictions"))
    results.to_sql("incident_risk_predictions", engine, index=False, if_exists="replace")

    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE incident_risk_predictions ADD COLUMN id SERIAL PRIMARY KEY"
        ))

    print(f"Wrote {len(results)} incident risk predictions to incident_risk_predictions")

if __name__ == "__main__":
    run()
