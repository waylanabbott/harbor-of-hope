"""
Run full ETL + inference pipeline for all active prediction models.

Usage:
  # With env vars for production DB:
  DB_HOST=<azure-host> DB_PORT=5432 DB_NAME=harbor_of_hope DB_USER=<user> DB_PASS=<pass> python run_all_predictions.py

  # Local (uses defaults from config.py):
  python run_all_predictions.py
"""
import traceback

def run_pipeline(name, etl_module, inference_module):
    print(f"\n{'='*50}")
    print(f"  {name}")
    print(f"{'='*50}")
    try:
        print(f"  [1/2] Running ETL...")
        etl_module.run()
        print(f"  [2/2] Running inference...")
        inference_module.run()
        print(f"  Done: {name}")
    except Exception as e:
        print(f"  FAILED: {name} — {e}")
        traceback.print_exc()

if __name__ == "__main__":
    import etl_donor_churn, run_inference_donor_churn
    import etl_incident_risk, run_inference_incident_risk
    import run_inference_campaign

    run_pipeline("Donor Churn Predictions", etl_donor_churn, run_inference_donor_churn)
    run_pipeline("Incident Risk Predictions", etl_incident_risk, run_inference_incident_risk)

    # Campaign has no separate ETL — inference script handles it
    print(f"\n{'='*50}")
    print(f"  Campaign Effectiveness Predictions")
    print(f"{'='*50}")
    try:
        run_inference_campaign.run()
        print(f"  Done: Campaign Effectiveness")
    except Exception as e:
        print(f"  FAILED: Campaign Effectiveness — {e}")
        traceback.print_exc()

    print("\nAll pipelines complete.")
