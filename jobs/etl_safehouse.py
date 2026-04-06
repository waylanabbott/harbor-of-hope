"""
ETL: Safehouse Outcomes
Reads safehouse_monthly_metrics, safehouses, residents, etc.,
writes modeling table `ml_safehouse_features` to the database.
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING

engine = create_engine(CONNECTION_STRING)

def run():
    metrics = pd.read_sql("SELECT * FROM safehouse_monthly_metrics", engine)
    safehouses = pd.read_sql("SELECT * FROM safehouses", engine)
    residents = pd.read_sql("SELECT * FROM residents", engine)

    if metrics.empty:
        print("No safehouse metrics found. Skipping.")
        return

    # Resident counts and demographics per safehouse
    res_agg = residents.groupby("safehouse_id").agg(
        total_residents=("resident_id", "count"),
        pwd_count=("is_pwd", "sum"),
        special_needs_count=("has_special_needs", "sum"),
    ).reset_index()

    df = metrics.merge(
        safehouses[["safehouse_id", "region", "capacity_girls", "current_occupancy"]],
        on="safehouse_id", how="left"
    )
    df = df.merge(res_agg, on="safehouse_id", how="left")

    df["avg_education_progress"] = pd.to_numeric(df["avg_education_progress"], errors="coerce").fillna(0)
    df["avg_health_score"] = pd.to_numeric(df["avg_health_score"], errors="coerce").fillna(0)
    df["process_recording_count"] = pd.to_numeric(df["process_recording_count"], errors="coerce").fillna(0)
    df["home_visitation_count"] = pd.to_numeric(df["home_visitation_count"], errors="coerce").fillna(0)
    df["incident_count"] = pd.to_numeric(df["incident_count"], errors="coerce").fillna(0)
    df["capacity_girls"] = pd.to_numeric(df["capacity_girls"], errors="coerce").fillna(0)
    df["current_occupancy"] = pd.to_numeric(df["current_occupancy"], errors="coerce").fillna(0)
    df["total_residents"] = df["total_residents"].fillna(0)
    df["pwd_count"] = df["pwd_count"].fillna(0)
    df["special_needs_count"] = df["special_needs_count"].fillna(0)

    # Occupancy rate
    df["occupancy_rate"] = np.where(
        df["capacity_girls"] > 0,
        df["current_occupancy"] / df["capacity_girls"],
        0
    )

    # Target: avg_health_score (continuous outcome for explanatory model)
    keep_cols = [
        "metric_id", "safehouse_id", "region", "capacity_girls",
        "current_occupancy", "occupancy_rate", "active_residents",
        "total_residents", "pwd_count", "special_needs_count",
        "avg_education_progress", "process_recording_count",
        "home_visitation_count", "incident_count", "avg_health_score",
    ]
    out = df[[c for c in keep_cols if c in df.columns]].copy()

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS ml_safehouse_features"))
    out.to_sql("ml_safehouse_features", engine, index=False, if_exists="replace")
    print(f"Wrote {len(out)} rows to ml_safehouse_features")

if __name__ == "__main__":
    run()
