"""
Inference: Donation Forecast
Loads trained model, predicts next-month donation totals,
writes predictions to `donation_forecast_predictions` table in PostgreSQL.
"""
import os, joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    model_path = os.path.join(ARTIFACTS_DIR, "donation_forecast.sav")
    pipe = joblib.load(model_path)

    df = pd.read_sql("SELECT * FROM ml_donation_forecast_features", engine)
    if df.empty:
        print("No feature data. Skipping inference.")
        return

    numeric_features = ["donation_count", "avg_amount", "unique_donors",
                        "recurring_count", "prev_month_amount",
                        "prev_month_count", "rolling_3m_avg", "month_index"]

    avail_num = [c for c in numeric_features if c in df.columns]

    X = df[avail_num].astype(float)
    predicted_amounts = pipe.predict(X)

    results = pd.DataFrame({
        "year_month": df["year_month"],
        "actual_amount": df["total_amount"].round(2),
        "predicted_amount": np.round(predicted_amounts, 2),
        "residual": np.round(df["total_amount"].astype(float) - predicted_amounts, 2),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    })

    # Also add a future forecast row for the next month
    last_row = df.iloc[-1:].copy()
    last_row["month_index"] = last_row["month_index"] + 1
    last_row["prev_month_amount"] = last_row["total_amount"]
    last_row["prev_month_count"] = last_row["donation_count"]
    X_future = last_row[avail_num].astype(float)
    future_pred = pipe.predict(X_future)

    future_row = pd.DataFrame({
        "year_month": ["NEXT_MONTH"],
        "actual_amount": [None],
        "predicted_amount": [round(float(future_pred[0]), 2)],
        "residual": [None],
        "prediction_timestamp": [datetime.utcnow().isoformat()],
    })
    results = pd.concat([results, future_row], ignore_index=True)

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS donation_forecast_predictions"))
    results.to_sql("donation_forecast_predictions", engine, index=False, if_exists="replace")

    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE donation_forecast_predictions ADD COLUMN id SERIAL PRIMARY KEY"
        ))

    print(f"Wrote {len(results)} donation forecast predictions to donation_forecast_predictions")

if __name__ == "__main__":
    run()
