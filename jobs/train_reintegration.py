"""
Train: Reintegration Readiness Classifier (Predictive)
Reads ml_reintegration_features, trains sklearn Pipeline,
saves .sav + metadata.json + metrics.json to artifacts/.
"""
import json, os, joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import f1_score, roc_auc_score
from sqlalchemy import create_engine
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    df = pd.read_sql("SELECT * FROM ml_reintegration_features", engine)

    numeric_features = ["avg_attendance", "avg_progress", "education_record_count",
                        "avg_health_score", "avg_nutrition", "avg_sleep",
                        "health_record_count", "session_count", "progress_noted_count",
                        "home_visit_count", "length_of_stay_days", "is_pwd", "has_special_needs"]
    categorical_features = ["case_status", "sex", "case_category",
                            "initial_risk_level", "current_risk_level"]

    avail_num = [c for c in numeric_features if c in df.columns]
    avail_cat = [c for c in categorical_features if c in df.columns]

    for col in avail_cat:
        df[col] = df[col].fillna("Unknown")

    X = df[avail_num + avail_cat]
    y = df["reintegration_success"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = ColumnTransformer(transformers=[
        ("num", StandardScaler(), avail_num),
        ("cat", OneHotEncoder(drop="first", handle_unknown="ignore", sparse_output=False), avail_cat),
    ])

    pipe = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(n_estimators=100, max_depth=3,
                                               random_state=42, class_weight="balanced")),
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

    model_path = os.path.join(ARTIFACTS_DIR, "reintegration.sav")
    joblib.dump(pipe, model_path)

    metadata = {
        "model_name": "reintegration",
        "model_type": "RandomForestClassifier",
        "approach": "predictive",
        "numeric_features": avail_num,
        "categorical_features": avail_cat,
        "target": "reintegration_success",
    }
    with open(os.path.join(ARTIFACTS_DIR, "reintegration_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    metrics = {
        "cv_f1_mean": float(cv_scores.mean()),
        "cv_f1_std": float(cv_scores.std()),
        "test_f1": float(test_f1),
        "test_auc": float(test_auc),
        "train_size": len(X_train),
        "test_size": len(X_test),
    }
    with open(os.path.join(ARTIFACTS_DIR, "reintegration_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Model saved to {model_path}")
    print(f"CV F1: {cv_scores.mean():.4f}, Test F1: {test_f1:.4f}")

if __name__ == "__main__":
    run()
