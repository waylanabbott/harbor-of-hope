"""
ETL: Incident Risk
Reads residents, incident_reports, and related tables,
writes modeling table `ml_incident_risk_features` to the database.
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING

engine = create_engine(CONNECTION_STRING)

def run():
    residents = pd.read_sql("SELECT * FROM residents", engine)
    incidents = pd.read_sql("SELECT * FROM incident_reports", engine)
    health = pd.read_sql("SELECT * FROM health_wellbeing_records", engine)
    process = pd.read_sql("SELECT * FROM process_recordings", engine)

    if residents.empty:
        print("No residents found. Skipping.")
        return

    # Incident count per resident
    inc_agg = incidents.groupby("resident_id").agg(
        incident_count=("incident_id", "count"),
        severe_count=("severity", lambda x: (x == "Severe").sum()),
    ).reset_index()

    # Health aggregates
    health_agg = health.groupby("resident_id").agg(
        avg_health_score=("general_health_score", "mean"),
        avg_sleep=("sleep_quality_score", "mean"),
    ).reset_index()

    # Session count
    proc_agg = process.groupby("resident_id").agg(
        session_count=("recording_id", "count"),
        concerns_flagged_total=("concerns_flagged", "sum"),
    ).reset_index()

    df = residents[["resident_id", "safehouse_id", "case_status", "sex",
                     "case_category", "is_pwd", "has_special_needs",
                     "initial_risk_level", "current_risk_level",
                     "sub_cat_physical_abuse", "sub_cat_sexual_abuse",
                     "sub_cat_trafficked", "sub_cat_at_risk",
                     "date_of_admission"]].copy()

    df = df.merge(inc_agg, on="resident_id", how="left")
    df = df.merge(health_agg, on="resident_id", how="left")
    df = df.merge(proc_agg, on="resident_id", how="left")

    fill_cols = ["incident_count", "severe_count", "avg_health_score",
                 "avg_sleep", "session_count", "concerns_flagged_total"]
    for col in fill_cols:
        if col in df.columns:
            df[col] = df[col].fillna(0)

    df["date_of_admission"] = pd.to_datetime(df["date_of_admission"], utc=True, errors="coerce")
    df["length_of_stay_days"] = (pd.Timestamp.now(tz="UTC") - df["date_of_admission"]).dt.days.fillna(0)

    # Binary target: has_incident (1 if any incident, 0 otherwise)
    df["has_incident"] = (df["incident_count"] > 0).astype(int)

    bool_cols = ["is_pwd", "has_special_needs", "sub_cat_physical_abuse",
                 "sub_cat_sexual_abuse", "sub_cat_trafficked", "sub_cat_at_risk"]
    for col in bool_cols:
        df[col] = df[col].astype(int)

    df.drop(columns=["date_of_admission"], inplace=True)

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS ml_incident_risk_features"))
    df.to_sql("ml_incident_risk_features", engine, index=False, if_exists="replace")
    print(f"Wrote {len(df)} rows to ml_incident_risk_features")

if __name__ == "__main__":
    run()
