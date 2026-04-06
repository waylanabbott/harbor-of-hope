"""
Train: Donation Forecast Regressor (Predictive)
Reads ml_donation_forecast_features, trains regression pipeline,
saves .sav + metadata.json + metrics.json to artifacts/.
"""
import json, os, joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sqlalchemy import create_engine
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    df = pd.read_sql("SELECT * FROM ml_donation_forecast_features", engine)

    numeric_features = ["donation_count", "avg_amount", "unique_donors",
                        "recurring_count", "prev_month_amount",
                        "prev_month_count", "rolling_3m_avg", "month_index"]

    avail_num = [c for c in numeric_features if c in df.columns]

    X = df[avail_num].astype(float)
    y = df["total_amount"].astype(float)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("regressor", GradientBoostingRegressor(n_estimators=100, max_depth=3, random_state=42)),
    ])

    cv_scores = cross_val_score(pipe, X_train, y_train, cv=min(5, len(X_train)), scoring="r2")
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    test_r2 = r2_score(y_test, y_pred)
    test_rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    test_mae = float(mean_absolute_error(y_test, y_pred))

    model_path = os.path.join(ARTIFACTS_DIR, "donation_forecast.sav")
    joblib.dump(pipe, model_path)

    metadata = {
        "model_name": "donation_forecast",
        "model_type": "GradientBoostingRegressor",
        "approach": "predictive",
        "numeric_features": avail_num,
        "categorical_features": [],
        "target": "total_amount",
    }
    with open(os.path.join(ARTIFACTS_DIR, "donation_forecast_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    metrics = {
        "cv_r2_mean": float(cv_scores.mean()),
        "cv_r2_std": float(cv_scores.std()),
        "test_r2": float(test_r2),
        "test_rmse": test_rmse,
        "test_mae": test_mae,
        "train_size": len(X_train),
        "test_size": len(X_test),
    }
    with open(os.path.join(ARTIFACTS_DIR, "donation_forecast_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Model saved to {model_path}")
    print(f"CV R2: {cv_scores.mean():.4f}, Test R2: {test_r2:.4f}")

if __name__ == "__main__":
    run()
