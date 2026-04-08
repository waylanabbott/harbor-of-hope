"""
ETL: Incident Risk
Reads residents, health, education, process recordings, and home visitations,
writes modeling table `ml_incident_risk_features` to the database.
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING

engine = create_engine(CONNECTION_STRING)

def run():
    residents = pd.read_sql("SELECT * FROM residents", engine)
    health = pd.read_sql("SELECT * FROM health_wellbeing_records", engine)
    education = pd.read_sql("SELECT * FROM education_records", engine)
    process = pd.read_sql("SELECT * FROM process_recordings", engine)
    visits = pd.read_sql("SELECT * FROM home_visitations", engine)

    if residents.empty:
        print("No residents found. Skipping.")
        return

    # Health aggregates
    health_agg = health.groupby("resident_id").agg(
        avg_health_score=("general_health_score", "mean"),
    ).reset_index()

    # Education aggregates
    edu_agg = education.groupby("resident_id").agg(
        avg_education_attendance=("attendance_rate", "mean"),
        avg_education_progress=("progress_percent", "mean"),
    ).reset_index()

    # Session aggregates
    proc_agg = process.groupby("resident_id").agg(
        session_count=("recording_id", "count"),
        avg_session_duration=("session_duration_minutes", "mean"),
    ).reset_index()

    # Visit count
    visit_agg = visits.groupby("resident_id").agg(
        visit_count=("visitation_id", "count"),
    ).reset_index()

    # Length of stay
    residents["date_of_admission"] = pd.to_datetime(residents["date_of_admission"], utc=True, errors="coerce")
    residents["length_of_stay"] = (pd.Timestamp.now(tz="UTC") - residents["date_of_admission"]).dt.days.fillna(0)

    df = residents[["resident_id", "safehouse_id", "case_status",
                     "initial_risk_level", "case_category",
                     "length_of_stay"]].copy()

    df = df.merge(health_agg, on="resident_id", how="left")
    df = df.merge(edu_agg, on="resident_id", how="left")
    df = df.merge(proc_agg, on="resident_id", how="left")
    df = df.merge(visit_agg, on="resident_id", how="left")

    fill_cols = ["avg_health_score", "avg_education_attendance",
                 "avg_education_progress", "session_count",
                 "avg_session_duration", "visit_count"]
    for col in fill_cols:
        if col in df.columns:
            df[col] = df[col].fillna(0)

    # Write to database
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS ml_incident_risk_features"))
    df.to_sql("ml_incident_risk_features", engine, index=False, if_exists="replace")
    print(f"Wrote {len(df)} rows to ml_incident_risk_features")

if __name__ == "__main__":
    run()
