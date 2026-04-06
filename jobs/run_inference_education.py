"""
Inference: Education Outcome
Loads trained model, predicts education completion for all records,
writes predictions to `education_predictions` table in PostgreSQL.
"""
import os, joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    model_path = os.path.join(ARTIFACTS_DIR, "education_outcome.sav")
    pipe = joblib.load(model_path)

    df = pd.read_sql("SELECT * FROM ml_education_features", engine)
    if df.empty:
        print("No feature data. Skipping inference.")
        return

    numeric_features = ["attendance_rate", "progress_percent", "is_pwd",
                        "has_special_needs", "general_health_score",
                        "nutrition_score", "sleep_quality_score"]
    categorical_features = ["education_level", "enrollment_status", "sex",
                            "case_category", "initial_risk_level"]

    avail_num = [c for c in numeric_features if c in df.columns]
    avail_cat = [c for c in categorical_features if c in df.columns]

    for col in avail_cat:
        df[col] = df[col].fillna("Unknown")

    X = df[avail_num + avail_cat]

    predictions = pipe.predict(X)
    probabilities = pipe.predict_proba(X)

    results = pd.DataFrame({
        "education_record_id": df["education_record_id"].astype(int),
        "resident_id": df["resident_id"].astype(int),
        "completion_probability": probabilities[:, 1].round(4),
        "completion_prediction": predictions.astype(int),
        "outcome_level": pd.cut(
            probabilities[:, 1],
            bins=[-0.01, 0.3, 0.6, 1.01],
            labels=["At Risk", "On Track", "Excelling"],
        ).astype(str),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    })

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS education_predictions"))
    results.to_sql("education_predictions", engine, index=False, if_exists="replace")

    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE education_predictions ADD COLUMN id SERIAL PRIMARY KEY"
        ))

    print(f"Wrote {len(results)} education predictions to education_predictions")

if __name__ == "__main__":
    run()
