"""
RetailCell AI Service - Model Training
Trains RandomForestRegressor for demand forecasting and
GradientBoostingClassifier for stock risk classification.
"""
import os
import pickle
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    r2_score, mean_absolute_error, mean_squared_error,
    accuracy_score, precision_score, recall_score, f1_score, classification_report
)


def load_data(csv_path: str = None) -> pd.DataFrame:
    """Load and preprocess training data."""
    if csv_path is None:
        csv_path = os.path.join(os.path.dirname(__file__), "dataset.csv")

    if not os.path.exists(csv_path):
        from app.ml.generate_data import generate_dataset
        generate_dataset(csv_path)

    df = pd.read_csv(csv_path)
    return df


def train_models(csv_path: str = None) -> dict:
    """Train both forecasting and classification models."""
    df = load_data(csv_path)

    # Encode categorical features
    le_category = LabelEncoder()
    le_region = LabelEncoder()
    le_risk = LabelEncoder()

    df["category_encoded"] = le_category.fit_transform(df["category"])
    df["region_encoded"] = le_region.fit_transform(df["region"])
    df["risk_encoded"] = le_risk.fit_transform(df["risk_label"])

    # Features for both models
    feature_cols = [
        "category_encoded", "region_encoded", "price",
        "stock_level", "reorder_level", "is_promotion",
        "day_of_week", "month", "avg_daily_sales_7d",
        "avg_daily_sales_30d", "days_since_last_restock",
        "supplier_lead_time_days"
    ]

    X = df[feature_cols].values

    # ===== DEMAND FORECASTING (Regression) =====
    y_demand = df["quantity_sold"].values
    X_train_d, X_test_d, y_train_d, y_test_d = train_test_split(X, y_demand, test_size=0.2, random_state=42)

    demand_model = RandomForestRegressor(
        n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
    )
    demand_model.fit(X_train_d, y_train_d)
    y_pred_d = demand_model.predict(X_test_d)

    demand_metrics = {
        "r2_score": round(r2_score(y_test_d, y_pred_d), 4),
        "mae": round(mean_absolute_error(y_test_d, y_pred_d), 4),
        "rmse": round(np.sqrt(mean_squared_error(y_test_d, y_pred_d)), 4),
    }

    # ===== RISK CLASSIFICATION =====
    y_risk = df["risk_encoded"].values
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X, y_risk, test_size=0.2, random_state=42)

    risk_model = GradientBoostingClassifier(
        n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42
    )
    risk_model.fit(X_train_r, y_train_r)
    y_pred_r = risk_model.predict(X_test_r)

    risk_metrics = {
        "accuracy": round(accuracy_score(y_test_r, y_pred_r), 4),
        "precision": round(precision_score(y_test_r, y_pred_r, average="weighted", zero_division=0), 4),
        "recall": round(recall_score(y_test_r, y_pred_r, average="weighted", zero_division=0), 4),
        "f1_score": round(f1_score(y_test_r, y_pred_r, average="weighted", zero_division=0), 4),
    }

    report = classification_report(
        y_test_r, y_pred_r,
        target_names=le_risk.classes_,
        output_dict=True
    )

    # Save models
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    model_bundle = {
        "demand_model": demand_model,
        "risk_model": risk_model,
        "le_category": le_category,
        "le_region": le_region,
        "le_risk": le_risk,
        "feature_cols": feature_cols,
        "demand_metrics": demand_metrics,
        "risk_metrics": risk_metrics,
        "classification_report": report,
        "version": "1.0.0",
        "training_rows": len(df),
    }

    with open(model_path, "wb") as f:
        pickle.dump(model_bundle, f)

    return model_bundle


if __name__ == "__main__":
    train_models()
