"""
Train: Donor Churn Classifier (Predictive)
Reads ml_donor_churn_features, trains sklearn Pipeline,
saves .sav + metadata.json + metrics.json to artifacts/.
"""
import json, os, joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import classification_report, f1_score, roc_auc_score
from sqlalchemy import create_engine
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    df = pd.read_sql("SELECT * FROM ml_donor_churn_features", engine)

    numeric_features = ["recency", "frequency", "monetary_total", "monetary_avg",
                        "monetary_std", "tenure_days"]
    categorical_features = ["supporter_type", "acquisition_channel", "region"]

    X = df[numeric_features + categorical_features]
    y = df["churned"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    preprocessor = ColumnTransformer(transformers=[
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(drop="first", handle_unknown="ignore", sparse_output=False), categorical_features),
    ])

    pipe = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", DecisionTreeClassifier(max_depth=3, random_state=42, class_weight="balanced")),
    ])

    # Cross-validate
    cv_scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring="f1")

    # Fit on full training set
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    y_proba = pipe.predict_proba(X_test)[:, 1]
    test_f1 = f1_score(y_test, y_pred)
    test_auc = roc_auc_score(y_test, y_proba)

    # Save model
    model_path = os.path.join(ARTIFACTS_DIR, "donor_churn.sav")
    joblib.dump(pipe, model_path)

    # Save metadata
    metadata = {
        "model_name": "donor_churn",
        "model_type": "DecisionTreeClassifier",
        "approach": "predictive",
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "target": "churned",
    }
    with open(os.path.join(ARTIFACTS_DIR, "donor_churn_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    # Save metrics
    metrics = {
        "cv_f1_mean": float(cv_scores.mean()),
        "cv_f1_std": float(cv_scores.std()),
        "test_f1": float(test_f1),
        "test_auc": float(test_auc),
        "train_size": len(X_train),
        "test_size": len(X_test),
    }
    with open(os.path.join(ARTIFACTS_DIR, "donor_churn_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Model saved to {model_path}")
    print(f"CV F1: {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")
    print(f"Test F1: {test_f1:.4f}, Test AUC: {test_auc:.4f}")

if __name__ == "__main__":
    run()
