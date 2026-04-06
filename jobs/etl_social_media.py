"""
ETL: Social Media Effectiveness
Reads social_media_posts, engineers features for OLS regression,
writes modeling table `ml_social_media_features` to the database.
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING

engine = create_engine(CONNECTION_STRING)

def run():
    posts = pd.read_sql("SELECT * FROM social_media_posts", engine)

    if posts.empty:
        print("No social media posts found. Skipping.")
        return

    df = posts.copy()
    df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")

    # Numeric target: engagement_rate
    df["engagement_rate"] = pd.to_numeric(df["engagement_rate"], errors="coerce")
    df = df.dropna(subset=["engagement_rate"])

    # Feature engineering
    df["has_cta"] = df["has_call_to_action"].astype(int)
    df["is_boosted_int"] = df["is_boosted"].astype(int)
    df["features_story_int"] = df["features_resident_story"].astype(int)
    df["num_hashtags"] = df["num_hashtags"].fillna(0).astype(int)
    df["mentions_count"] = df["mentions_count"].fillna(0).astype(int)
    df["caption_length"] = df["caption_length"].fillna(0).astype(int)
    df["post_hour"] = df["post_hour"].fillna(12).astype(int)
    df["impressions"] = pd.to_numeric(df["impressions"], errors="coerce").fillna(0)
    df["reach"] = pd.to_numeric(df["reach"], errors="coerce").fillna(0)
    df["likes"] = pd.to_numeric(df["likes"], errors="coerce").fillna(0)
    df["comments"] = pd.to_numeric(df["comments"], errors="coerce").fillna(0)
    df["shares"] = pd.to_numeric(df["shares"], errors="coerce").fillna(0)

    # Keep relevant columns
    keep_cols = [
        "post_id", "platform", "post_type", "media_type", "content_topic",
        "sentiment_tone", "has_cta", "is_boosted_int", "features_story_int",
        "num_hashtags", "mentions_count", "caption_length", "post_hour",
        "impressions", "reach", "likes", "comments", "shares",
        "engagement_rate",
    ]
    out = df[[c for c in keep_cols if c in df.columns]].copy()

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS ml_social_media_features"))
    out.to_sql("ml_social_media_features", engine, index=False, if_exists="replace")
    print(f"Wrote {len(out)} rows to ml_social_media_features")

if __name__ == "__main__":
    run()
