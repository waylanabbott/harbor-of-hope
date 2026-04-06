"""
Inference: Safehouse Outcomes
Loads trained model, predicts health outcomes for all safehouse metrics,
writes predictions to `safehouse_predictions` table in PostgreSQL.
"""
import os, joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    model_path = os.path.join(ARTIFACTS_DIR, "safehouse_outcomes.sav")
    pipe = joblib.load(model_path)

    df = pd.read_sql("SELECT * FROM ml_safehouse_features", engine)
    if df.empty:
        print("No feature data. Skipping inference.")
        return

    numeric_features = ["capacity_girls", "current_occupancy", "occupancy_rate",
                        "total_residents", "pwd_count", "special_needs_count",
                        "avg_education_progress", "process_recording_count",
                        "home_visitation_count", "incident_count"]
    categorical_features = ["region"]

    avail_num = [c for c in numeric_features if c in df.columns]
    avail_cat = [c for c in categorical_features if c in df.columns]

    for col in avail_cat:
        df[col] = df[col].fillna("Unknown")

    X = df[avail_num + avail_cat]
    predicted_health = pipe.predict(X)

    results = pd.DataFrame({
        "safehouse_id": df["safehouse_id"].astype(int),
        "predicted_health_score": np.round(predicted_health, 4),
        "actual_health_score": df["avg_health_score"].round(4),
        "residual": np.round(df["avg_health_score"].astype(float) - predicted_health, 4),
        "performance_label": np.where(
            predicted_health > df["avg_health_score"].astype(float).median(),
            "Above Average", "Below Average"
        ),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    })

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS safehouse_predictions"))
    results.to_sql("safehouse_predictions", engine, index=False, if_exists="replace")

    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE safehouse_predictions ADD COLUMN id SERIAL PRIMARY KEY"
        ))

    print(f"Wrote {len(results)} safehouse predictions to safehouse_predictions")

if __name__ == "__main__":
    run()
