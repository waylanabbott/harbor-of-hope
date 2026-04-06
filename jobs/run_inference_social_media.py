"""
Inference: Social Media Effectiveness
Loads trained model, predicts engagement for all posts,
writes predictions to `social_media_predictions` table in PostgreSQL.
"""
import os, joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    model_path = os.path.join(ARTIFACTS_DIR, "social_media.sav")
    pipe = joblib.load(model_path)

    df = pd.read_sql("SELECT * FROM ml_social_media_features", engine)
    if df.empty:
        print("No feature data. Skipping inference.")
        return

    numeric_features = ["has_cta", "is_boosted_int", "features_story_int",
                        "num_hashtags", "mentions_count", "caption_length", "post_hour"]
    categorical_features = ["platform", "post_type", "media_type", "content_topic",
                            "sentiment_tone"]
    avail_cat = [c for c in categorical_features if c in df.columns]

    X = df[numeric_features + avail_cat]
    predicted_engagement = pipe.predict(X)

    results = pd.DataFrame({
        "post_id": df["post_id"].astype(int),
        "predicted_engagement_rate": np.round(predicted_engagement, 4),
        "actual_engagement_rate": df["engagement_rate"].round(4),
        "residual": np.round(df["engagement_rate"].astype(float) - predicted_engagement, 4),
        "recommendation": np.where(
            predicted_engagement > df["engagement_rate"].astype(float).median(),
            "Above Average Predicted Engagement",
            "Below Average Predicted Engagement"
        ),
        "prediction_timestamp": datetime.utcnow().isoformat(),
    })

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS social_media_predictions"))
    results.to_sql("social_media_predictions", engine, index=False, if_exists="replace")

    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE social_media_predictions ADD COLUMN id SERIAL PRIMARY KEY"
        ))

    print(f"Wrote {len(results)} social media predictions to social_media_predictions")

if __name__ == "__main__":
    run()
