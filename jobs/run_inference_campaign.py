"""
Inference: Campaign Effectiveness
Loads trained campaign model, predicts donation value for all social media posts,
writes predictions to `campaign_predictions` table in PostgreSQL.
"""
import os, joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    model_path = os.path.join(ARTIFACTS_DIR, "campaign_funding.sav")
    pipe = joblib.load(model_path)

    df = pd.read_sql("SELECT * FROM social_media_posts", engine)
    if df.empty:
        print("No social media posts. Skipping inference.")
        return

    # Features must match the training notebook (09-campaign-effectiveness)
    numeric_features = [
        "boost_budget_php", "num_hashtags", "caption_length", "post_hour",
    ]
    binary_features = ["is_boosted", "has_call_to_action", "features_resident_story"]
    categorical_features = [
        "platform", "post_type", "media_type", "content_topic", "sentiment_tone",
        "campaign_name",
    ]

    all_features = numeric_features + binary_features + categorical_features

    for col in numeric_features:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    for col in binary_features:
        if col in df.columns:
            df[col] = df[col].astype(int)

    for col in categorical_features:
        if col in df.columns:
            df[col] = df[col].fillna("Unknown")

    avail = [c for c in all_features if c in df.columns]
    X = df[avail]

    predicted_log = pipe.predict(X)
    predicted_php = np.expm1(predicted_log)

    actual_php = pd.to_numeric(df.get("estimated_donation_value_php", 0), errors="coerce").fillna(0)

    results = pd.DataFrame({
        "post_id": df["post_id"].astype(int),
        "platform": df["platform"],
        "campaign_name": df.get("campaign_name", ""),
        "post_type": df.get("post_type", ""),
        "estimated_donation_value_php": actual_php.round(2),
        "predicted_donation_value_php": predicted_php.round(2),
        "prediction_error_php": (actual_php - predicted_php).round(2),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    })

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS campaign_predictions"))
    results.to_sql("campaign_predictions", engine, index=False, if_exists="replace")

    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE campaign_predictions ADD COLUMN id SERIAL PRIMARY KEY"
        ))

    print(f"Wrote {len(results)} campaign predictions to campaign_predictions")

if __name__ == "__main__":
    run()
