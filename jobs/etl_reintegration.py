"""
ETL: Reintegration Readiness
Reads residents and related tables, engineers features,
writes modeling table `ml_reintegration_features` to the database.
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING

engine = create_engine(CONNECTION_STRING)

def run():
    residents = pd.read_sql("SELECT * FROM residents", engine)
    education = pd.read_sql("SELECT * FROM education_records", engine)
    health = pd.read_sql("SELECT * FROM health_wellbeing_records", engine)
    process = pd.read_sql("SELECT * FROM process_recordings", engine)
    home_visits = pd.read_sql("SELECT * FROM home_visitations", engine)

    if residents.empty:
        print("No residents found. Skipping.")
        return

    # Aggregate education per resident
    edu_agg = education.groupby("resident_id").agg(
        avg_attendance=("attendance_rate", "mean"),
        avg_progress=("progress_percent", "mean"),
        education_record_count=("education_record_id", "count"),
    ).reset_index()

    # Aggregate health per resident
    health_agg = health.groupby("resident_id").agg(
        avg_health_score=("general_health_score", "mean"),
        avg_nutrition=("nutrition_score", "mean"),
        avg_sleep=("sleep_quality_score", "mean"),
        health_record_count=("health_record_id", "count"),
    ).reset_index()

    # Aggregate counseling sessions per resident
    proc_agg = process.groupby("resident_id").agg(
        session_count=("recording_id", "count"),
        progress_noted_count=("progress_noted", "sum"),
    ).reset_index()

    # Aggregate home visits per resident
    hv_agg = home_visits.groupby("resident_id").agg(
        home_visit_count=("visitation_id", "count"),
    ).reset_index()

    # Merge all
    df = residents[["resident_id", "safehouse_id", "case_status", "sex",
                     "case_category", "is_pwd", "has_special_needs",
                     "reintegration_type", "reintegration_status",
                     "initial_risk_level", "current_risk_level",
                     "date_of_admission", "date_enrolled"]].copy()

    df = df.merge(edu_agg, on="resident_id", how="left")
    df = df.merge(health_agg, on="resident_id", how="left")
    df = df.merge(proc_agg, on="resident_id", how="left")
    df = df.merge(hv_agg, on="resident_id", how="left")

    # Fill NaN aggregates with 0
    fill_cols = ["avg_attendance", "avg_progress", "education_record_count",
                 "avg_health_score", "avg_nutrition", "avg_sleep", "health_record_count",
                 "session_count", "progress_noted_count", "home_visit_count"]
    for col in fill_cols:
        if col in df.columns:
            df[col] = df[col].fillna(0)

    # Length of stay
    df["date_of_admission"] = pd.to_datetime(df["date_of_admission"], utc=True, errors="coerce")
    df["date_enrolled"] = pd.to_datetime(df["date_enrolled"], utc=True, errors="coerce")
    reference = pd.Timestamp.now(tz="UTC")
    df["length_of_stay_days"] = (reference - df["date_of_admission"]).dt.days.fillna(0)

    # Binary target: reintegration_success (Completed = 1, else 0)
    df["reintegration_success"] = (df["reintegration_status"] == "Completed").astype(int)

    df["is_pwd"] = df["is_pwd"].astype(int)
    df["has_special_needs"] = df["has_special_needs"].astype(int)

    df.drop(columns=["date_of_admission", "date_enrolled"], inplace=True)

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS ml_reintegration_features"))
    df.to_sql("ml_reintegration_features", engine, index=False, if_exists="replace")
    print(f"Wrote {len(df)} rows to ml_reintegration_features")

if __name__ == "__main__":
    run()
