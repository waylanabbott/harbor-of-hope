"""
Inference: Donor Churn
Loads trained model, predicts churn for all supporters,
writes predictions to `donor_churn_predictions` table in PostgreSQL.
"""
import os, joblib
import pandas as pd
from datetime import datetime
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    model_path = os.path.join(ARTIFACTS_DIR, "donor_churn.sav")
    pipe = joblib.load(model_path)

    df = pd.read_sql("SELECT * FROM ml_donor_churn_features", engine)
    if df.empty:
        print("No feature data. Skipping inference.")
        return

    numeric_features = ["frequency", "monetary_avg", "last_donation_amount",
                        "tenure_days", "avg_days_between"]
    categorical_features = ["supporter_type", "acquisition_channel", "region"]

    for col in categorical_features:
        df[col] = df[col].fillna("Unknown")

    X = df[numeric_features + categorical_features]

    predictions = pipe.predict(X)
    probabilities = pipe.predict_proba(X)

    results = pd.DataFrame({
        "supporter_id": df["supporter_id"].astype(int),
        "churn_probability": probabilities[:, 1].round(4),
        "churn_prediction": predictions.astype(int),
        "churn_risk_level": pd.cut(
            probabilities[:, 1],
            bins=[-0.01, 0.4, 0.7, 1.01],
            labels=["Low", "Medium", "High"],
        ).astype(str),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    })

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS donor_churn_predictions"))
    results.to_sql("donor_churn_predictions", engine, index=False, if_exists="replace")

    # Add primary key
    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE donor_churn_predictions ADD COLUMN id SERIAL PRIMARY KEY"
        ))

    print(f"Wrote {len(results)} churn predictions to donor_churn_predictions")

if __name__ == "__main__":
    run()
