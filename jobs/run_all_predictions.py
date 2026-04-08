"""
Run full ETL + inference pipeline for all prediction models.
Populates social_media_predictions and counseling_predictions tables.

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
    import etl_social_media, run_inference_social_media
    import etl_counseling, run_inference_counseling

    run_pipeline("Social Media Predictions", etl_social_media, run_inference_social_media)
    run_pipeline("Counseling Predictions", etl_counseling, run_inference_counseling)

    print("\nAll pipelines complete.")
