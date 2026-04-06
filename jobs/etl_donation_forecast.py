"""
ETL: Donation Forecasting
Reads donations, engineers monthly aggregates,
writes modeling table `ml_donation_forecast_features` to the database.
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING

engine = create_engine(CONNECTION_STRING)

def run():
    donations = pd.read_sql("SELECT * FROM donations", engine)

    if donations.empty:
        print("No donations found. Skipping.")
        return

    monetary = donations[donations["donation_type"] == "Monetary"].copy()
    monetary["donation_date"] = pd.to_datetime(monetary["donation_date"], errors="coerce")
    monetary = monetary.dropna(subset=["donation_date"])

    # Monthly aggregation
    monetary["year_month"] = monetary["donation_date"].dt.to_period("M")
    monthly = monetary.groupby("year_month").agg(
        total_amount=("amount", "sum"),
        donation_count=("donation_id", "count"),
        avg_amount=("amount", "mean"),
        unique_donors=("supporter_id", "nunique"),
        recurring_count=("is_recurring", "sum"),
    ).reset_index()

    monthly["year_month"] = monthly["year_month"].astype(str)
    monthly = monthly.sort_values("year_month").reset_index(drop=True)

    # Lag features
    monthly["prev_month_amount"] = monthly["total_amount"].shift(1).fillna(0)
    monthly["prev_month_count"] = monthly["donation_count"].shift(1).fillna(0)
    monthly["rolling_3m_avg"] = monthly["total_amount"].rolling(3, min_periods=1).mean()

    # Month index for trend
    monthly["month_index"] = range(len(monthly))

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS ml_donation_forecast_features"))
    monthly.to_sql("ml_donation_forecast_features", engine, index=False, if_exists="replace")
    print(f"Wrote {len(monthly)} rows to ml_donation_forecast_features")

if __name__ == "__main__":
    run()
