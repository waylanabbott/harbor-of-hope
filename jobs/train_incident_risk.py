"""
Train: Incident Risk Classifier (Predictive)
Reads ml_incident_risk_features, trains sklearn Pipeline,
saves .sav + metadata.json + metrics.json to artifacts/.
"""
import json, os, joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import f1_score, roc_auc_score
from sqlalchemy import create_engine
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    df = pd.read_sql("SELECT * FROM ml_incident_risk_features", engine)

    numeric_features = ["is_pwd", "has_special_needs", "sub_cat_physical_abuse",
                        "sub_cat_sexual_abuse", "sub_cat_trafficked", "sub_cat_at_risk",
                        "avg_health_score", "avg_sleep", "session_count",
                        "concerns_flagged_total", "length_of_stay_days"]
    categorical_features = ["case_status", "sex", "case_category",
                            "initial_risk_level", "current_risk_level"]

    avail_num = [c for c in numeric_features if c in df.columns]
    avail_cat = [c for c in categorical_features if c in df.columns]

    for col in avail_cat:
        df[col] = df[col].fillna("Unknown")

    X = df[avail_num + avail_cat]
    y = df["has_incident"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = ColumnTransformer(transformers=[
        ("num", StandardScaler(), avail_num),
        ("cat", OneHotEncoder(drop="first", handle_unknown="ignore", sparse_output=False), avail_cat),
    ])

    pipe = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", GradientBoostingClassifier(n_estimators=100, max_depth=2, random_state=42)),
    ])

    cv_scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring="f1")
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    y_proba = pipe.predict_proba(X_test)[:, 1]
    test_f1 = f1_score(y_test, y_pred, zero_division=0)
    try:
        test_auc = roc_auc_score(y_test, y_proba)
    except ValueError:
        test_auc = 0.0

    model_path = os.path.join(ARTIFACTS_DIR, "incident_risk.sav")
    joblib.dump(pipe, model_path)

    metadata = {
        "model_name": "incident_risk",
        "model_type": "GradientBoostingClassifier",
        "approach": "predictive",
        "numeric_features": avail_num,
        "categorical_features": avail_cat,
        "target": "has_incident",
    }
    with open(os.path.join(ARTIFACTS_DIR, "incident_risk_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    metrics = {
        "cv_f1_mean": float(cv_scores.mean()),
        "cv_f1_std": float(cv_scores.std()),
        "test_f1": float(test_f1),
        "test_auc": float(test_auc),
        "train_size": len(X_train),
        "test_size": len(X_test),
    }
    with open(os.path.join(ARTIFACTS_DIR, "incident_risk_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Model saved to {model_path}")
    print(f"CV F1: {cv_scores.mean():.4f}, Test F1: {test_f1:.4f}")

if __name__ == "__main__":
    run()
