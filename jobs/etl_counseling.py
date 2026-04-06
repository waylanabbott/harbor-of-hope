"""
ETL: Counseling Effectiveness
Reads process_recordings, engineers features for OLS / regression,
writes modeling table `ml_counseling_features` to the database.
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING

engine = create_engine(CONNECTION_STRING)

# Map emotional state labels to numeric scores
EMOTIONAL_MAP = {
    "Distressed": 1, "Anxious": 2, "Withdrawn": 2,
    "Neutral": 3, "Calm": 4, "Positive": 5, "Happy": 5,
}

def run():
    process = pd.read_sql("SELECT * FROM process_recordings", engine)

    if process.empty:
        print("No process recordings found. Skipping.")
        return

    df = process.copy()

    # Numeric encoding of emotional states
    df["emotional_start_score"] = df["emotional_state_observed"].map(EMOTIONAL_MAP).fillna(3)
    df["emotional_end_score"] = df["emotional_state_end"].map(EMOTIONAL_MAP).fillna(3)
    df["emotional_improvement"] = df["emotional_end_score"] - df["emotional_start_score"]

    df["session_duration_minutes"] = pd.to_numeric(df["session_duration_minutes"], errors="coerce").fillna(45)
    df["progress_noted_int"] = df["progress_noted"].astype(int)
    df["concerns_flagged_int"] = df["concerns_flagged"].astype(int)
    df["referral_made_int"] = df["referral_made"].astype(int)

    # Intervention count (pipe-separated in interventions_applied)
    df["intervention_count"] = df["interventions_applied"].apply(
        lambda x: len(str(x).split("|")) if pd.notna(x) and str(x).strip() else 0
    )

    keep_cols = [
        "recording_id", "resident_id", "session_type",
        "session_duration_minutes", "emotional_start_score",
        "emotional_end_score", "emotional_improvement",
        "progress_noted_int", "concerns_flagged_int",
        "referral_made_int", "intervention_count",
    ]
    out = df[[c for c in keep_cols if c in df.columns]].copy()

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS ml_counseling_features"))
    out.to_sql("ml_counseling_features", engine, index=False, if_exists="replace")
    print(f"Wrote {len(out)} rows to ml_counseling_features")

if __name__ == "__main__":
    run()
