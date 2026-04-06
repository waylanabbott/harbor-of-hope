"""
Inference: Reintegration Readiness
Loads trained model, predicts readiness for all residents,
writes predictions to `reintegration_predictions` table in PostgreSQL.
"""
import os, joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    model_path = os.path.join(ARTIFACTS_DIR, "reintegration.sav")
    pipe = joblib.load(model_path)

    df = pd.read_sql("SELECT * FROM ml_reintegration_features", engine)
    if df.empty:
        print("No feature data. Skipping inference.")
        return

    numeric_features = ["avg_attendance", "avg_progress", "education_record_count",
                        "avg_health_score", "avg_nutrition", "avg_sleep",
                        "health_record_count", "session_count", "progress_noted_count",
                        "home_visit_count", "length_of_stay_days", "is_pwd", "has_special_needs"]
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
        "readiness_probability": probabilities[:, 1].round(4),
        "readiness_prediction": predictions.astype(int),
        "readiness_level": pd.cut(
            probabilities[:, 1],
            bins=[-0.01, 0.3, 0.6, 1.01],
            labels=["Low", "Moderate", "High"],
        ).astype(str),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    })

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS reintegration_predictions"))
    results.to_sql("reintegration_predictions", engine, index=False, if_exists="replace")

    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE reintegration_predictions ADD COLUMN id SERIAL PRIMARY KEY"
        ))

    print(f"Wrote {len(results)} reintegration predictions to reintegration_predictions")

if __name__ == "__main__":
    run()
