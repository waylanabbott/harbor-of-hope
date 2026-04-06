"""
Inference: Counseling Effectiveness
Loads trained model, predicts emotional improvement for all sessions,
writes predictions to `counseling_predictions` table in PostgreSQL.
"""
import os, joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    model_path = os.path.join(ARTIFACTS_DIR, "counseling.sav")
    pipe = joblib.load(model_path)

    df = pd.read_sql("SELECT * FROM ml_counseling_features", engine)
    if df.empty:
        print("No feature data. Skipping inference.")
        return

    numeric_features = ["session_duration_minutes", "emotional_start_score",
                        "intervention_count", "progress_noted_int",
                        "concerns_flagged_int", "referral_made_int"]
    categorical_features = ["session_type"]

    avail_cat = [c for c in categorical_features if c in df.columns]
    for col in avail_cat:
        df[col] = df[col].fillna("Unknown")

    X = df[numeric_features + avail_cat]
    predicted_improvement = pipe.predict(X)

    results = pd.DataFrame({
        "recording_id": df["recording_id"].astype(int),
        "resident_id": df["resident_id"].astype(int),
        "predicted_improvement": np.round(predicted_improvement, 4),
        "actual_improvement": df["emotional_improvement"].round(4),
        "session_type": df["session_type"],
        "effectiveness_label": np.where(
            predicted_improvement > 0, "Effective", "Needs Review"
        ),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    })

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS counseling_predictions"))
    results.to_sql("counseling_predictions", engine, index=False, if_exists="replace")

    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE counseling_predictions ADD COLUMN id SERIAL PRIMARY KEY"
        ))

    print(f"Wrote {len(results)} counseling predictions to counseling_predictions")

if __name__ == "__main__":
    run()
