"""
Train: Social Media Effectiveness (Explanatory OLS, sklearn Pipeline for inference)
Reads ml_social_media_features, trains regression pipeline,
saves .sav + metadata.json + metrics.json to artifacts/.
"""
import json, os, joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sqlalchemy import create_engine
from config import CONNECTION_STRING, ARTIFACTS_DIR

engine = create_engine(CONNECTION_STRING)

def run():
    df = pd.read_sql("SELECT * FROM ml_social_media_features", engine)

    numeric_features = ["has_cta", "is_boosted_int", "features_story_int",
                        "num_hashtags", "mentions_count", "caption_length", "post_hour"]
    categorical_features = ["platform", "post_type", "media_type", "content_topic",
                            "sentiment_tone"]

    # Drop rows missing target
    df = df.dropna(subset=["engagement_rate"])
    avail_cat = [c for c in categorical_features if c in df.columns]

    X = df[numeric_features + avail_cat]
    y = df["engagement_rate"].astype(float)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = ColumnTransformer(transformers=[
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(drop="first", handle_unknown="ignore", sparse_output=False), avail_cat),
    ])

    pipe = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", LinearRegression()),
    ])

    cv_scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring="r2")
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    test_r2 = r2_score(y_test, y_pred)
    test_rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    test_mae = float(mean_absolute_error(y_test, y_pred))

    model_path = os.path.join(ARTIFACTS_DIR, "social_media.sav")
    joblib.dump(pipe, model_path)

    metadata = {
        "model_name": "social_media",
        "model_type": "LinearRegression (OLS)",
        "approach": "explanatory",
        "numeric_features": numeric_features,
        "categorical_features": avail_cat,
        "target": "engagement_rate",
    }
    with open(os.path.join(ARTIFACTS_DIR, "social_media_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    metrics = {
        "cv_r2_mean": float(cv_scores.mean()),
        "cv_r2_std": float(cv_scores.std()),
        "test_r2": float(test_r2),
        "test_rmse": test_rmse,
        "test_mae": test_mae,
        "train_size": len(X_train),
        "test_size": len(X_test),
    }
    with open(os.path.join(ARTIFACTS_DIR, "social_media_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Model saved to {model_path}")
    print(f"CV R2: {cv_scores.mean():.4f}, Test R2: {test_r2:.4f}, RMSE: {test_rmse:.4f}")

if __name__ == "__main__":
    run()
