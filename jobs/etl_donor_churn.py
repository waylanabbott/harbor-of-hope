"""
ETL: Donor Churn
Reads supporters + donations from PostgreSQL, engineers RFM features,
writes modeling table `ml_donor_churn_features` back to the database.
"""
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from config import CONNECTION_STRING

engine = create_engine(CONNECTION_STRING)

def run():
    supporters = pd.read_sql("SELECT * FROM supporters", engine)
    donations = pd.read_sql("SELECT * FROM donations", engine)

    # Filter to monetary donations
    monetary = donations[donations["donation_type"] == "Monetary"].copy()
    monetary["donation_date"] = pd.to_datetime(monetary["donation_date"], utc=True)

    if monetary.empty:
        print("No monetary donations found. Skipping.")
        return

    reference_date = monetary["donation_date"].max()

    # Sort for per-supporter calculations
    monetary = monetary.sort_values(["supporter_id", "donation_date"])

    # RFM features per supporter
    rfm = monetary.groupby("supporter_id").agg(
        recency=("donation_date", lambda x: (reference_date - x.max()).days),
        frequency=("donation_id", "count"),
        monetary_total=("amount", "sum"),
        monetary_avg=("amount", "mean"),
        monetary_std=("amount", "std"),
        last_donation_amount=("amount", "last"),
        first_donation=("donation_date", "min"),
    ).reset_index()

    rfm["monetary_std"] = rfm["monetary_std"].fillna(0)
    rfm["tenure_days"] = (reference_date - rfm["first_donation"]).dt.days

    # Average days between donations
    def avg_gap(group):
        dates = group.sort_values()
        if len(dates) < 2:
            return 0.0
        gaps = dates.diff().dt.days.dropna()
        return gaps.mean()

    avg_between = monetary.groupby("supporter_id")["donation_date"].apply(avg_gap).reset_index()
    avg_between.columns = ["supporter_id", "avg_days_between"]
    rfm = rfm.merge(avg_between, on="supporter_id", how="left")
    rfm["avg_days_between"] = rfm["avg_days_between"].fillna(0)

    rfm.drop(columns=["first_donation"], inplace=True)

    # Merge with supporter demographics
    df = rfm.merge(
        supporters[["supporter_id", "supporter_type", "acquisition_channel", "status", "region"]],
        on="supporter_id",
        how="left",
    )

    # Binary target: churned if no donation in last 90 days
    df["churned"] = (df["recency"] > 90).astype(int)

    # Write to database
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS ml_donor_churn_features"))
    df.to_sql("ml_donor_churn_features", engine, index=False, if_exists="replace")
    print(f"Wrote {len(df)} rows to ml_donor_churn_features")

if __name__ == "__main__":
    run()
