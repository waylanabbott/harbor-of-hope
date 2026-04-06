"""
ETL: Education Outcome Prediction
Reads education_records and residents, engineers features,
writes modeling table `ml_education_features` to the database.
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING

engine = create_engine(CONNECTION_STRING)

def run():
    education = pd.read_sql("SELECT * FROM education_records", engine)
    residents = pd.read_sql("SELECT * FROM residents", engine)
    health = pd.read_sql("SELECT * FROM health_wellbeing_records", engine)

    if education.empty:
        print("No education records found. Skipping.")
        return

    # Latest health per resident
    health_latest = health.sort_values("record_date").groupby("resident_id").last().reset_index()
    health_latest = health_latest[["resident_id", "general_health_score", "nutrition_score",
                                    "sleep_quality_score"]].copy()

    df = education.merge(
        residents[["resident_id", "safehouse_id", "sex", "case_category",
                    "is_pwd", "has_special_needs", "initial_risk_level"]],
        on="resident_id", how="left"
    )
    df = df.merge(health_latest, on="resident_id", how="left")

    df["attendance_rate"] = pd.to_numeric(df["attendance_rate"], errors="coerce").fillna(0)
    df["progress_percent"] = pd.to_numeric(df["progress_percent"], errors="coerce").fillna(0)
    df["general_health_score"] = pd.to_numeric(df["general_health_score"], errors="coerce").fillna(0)
    df["nutrition_score"] = pd.to_numeric(df["nutrition_score"], errors="coerce").fillna(0)
    df["sleep_quality_score"] = pd.to_numeric(df["sleep_quality_score"], errors="coerce").fillna(0)

    # Binary target: completion (Completed = 1, else 0)
    df["completed"] = (df["completion_status"] == "Completed").astype(int)

    df["is_pwd"] = df["is_pwd"].astype(int)
    df["has_special_needs"] = df["has_special_needs"].astype(int)

    keep_cols = [
        "education_record_id", "resident_id", "safehouse_id",
        "education_level", "enrollment_status", "attendance_rate",
        "progress_percent", "sex", "case_category", "is_pwd",
        "has_special_needs", "initial_risk_level",
        "general_health_score", "nutrition_score", "sleep_quality_score",
        "completed",
    ]
    out = df[[c for c in keep_cols if c in df.columns]].copy()

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS ml_education_features"))
    out.to_sql("ml_education_features", engine, index=False, if_exists="replace")
    print(f"Wrote {len(out)} rows to ml_education_features")

if __name__ == "__main__":
    run()
