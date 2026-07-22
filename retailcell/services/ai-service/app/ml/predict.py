"""
RetailCell AI Service - Prediction Module
"""
import os
import pickle
import numpy as np
from typing import Optional


class PredictionService:
    """Handles demand forecasting and risk classification predictions."""

    def __init__(self):
        self.model_bundle = None
        self._load_model()

    def _load_model(self):
        model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
        if os.path.exists(model_path):
            with open(model_path, "rb") as f:
                self.model_bundle = pickle.load(f)
        else:
            # Train on first load
            from app.ml.train import train_models
            self.model_bundle = train_models()

    def reload_model(self):
        """Reload model from disk."""
        self._load_model()

    def _encode_features(self, category: str, region: str, price: float,
                         stock_level: int, reorder_level: int, is_promotion: int,
                         day_of_week: int, month: int, avg_7d: float, avg_30d: float,
                         days_since_restock: int, lead_time: int) -> np.ndarray:
        """Encode input features for prediction."""
        le_cat = self.model_bundle["le_category"]
        le_reg = self.model_bundle["le_region"]

        try:
            cat_encoded = le_cat.transform([category])[0]
        except ValueError:
            cat_encoded = 0

        try:
            reg_encoded = le_reg.transform([region])[0]
        except ValueError:
            reg_encoded = 0

        return np.array([[
            cat_encoded, reg_encoded, price, stock_level, reorder_level,
            is_promotion, day_of_week, month, avg_7d, avg_30d,
            days_since_restock, lead_time
        ]])

    def predict_demand(self, category: str, region: str, price: float,
                       stock_level: int, reorder_level: int, is_promotion: int = 0,
                       day_of_week: int = 1, month: int = 6, avg_7d: float = 5.0,
                       avg_30d: float = 4.0, days_since_restock: int = 10,
                       lead_time: int = 5) -> dict:
        """Predict demand for given parameters."""
        if not self.model_bundle:
            return {"error": "Model yüklenmedi."}

        X = self._encode_features(
            category, region, price, stock_level, reorder_level,
            is_promotion, day_of_week, month, avg_7d, avg_30d,
            days_since_restock, lead_time
        )

        demand = self.model_bundle["demand_model"].predict(X)[0]

        # Get prediction from all trees for confidence interval
        tree_preds = [tree.predict(X)[0] for tree in self.model_bundle["demand_model"].estimators_]
        lower = np.percentile(tree_preds, 5)
        upper = np.percentile(tree_preds, 95)

        return {
            "predicted_demand": round(float(demand), 2),
            "confidence_lower": round(float(lower), 2),
            "confidence_upper": round(float(upper), 2),
        }

    def predict_risk(self, category: str, region: str, price: float,
                     stock_level: int, reorder_level: int, is_promotion: int = 0,
                     day_of_week: int = 1, month: int = 6, avg_7d: float = 5.0,
                     avg_30d: float = 4.0, days_since_restock: int = 10,
                     lead_time: int = 5) -> dict:
        """Classify stock risk level."""
        if not self.model_bundle:
            return {"error": "Model yüklenmedi."}

        X = self._encode_features(
            category, region, price, stock_level, reorder_level,
            is_promotion, day_of_week, month, avg_7d, avg_30d,
            days_since_restock, lead_time
        )

        risk_encoded = self.model_bundle["risk_model"].predict(X)[0]
        risk_label = self.model_bundle["le_risk"].inverse_transform([risk_encoded])[0]

        proba = self.model_bundle["risk_model"].predict_proba(X)[0]
        risk_classes = self.model_bundle["le_risk"].classes_

        return {
            "risk_level": risk_label,
            "risk_score": round(float(max(proba)), 4),
            "probabilities": {
                cls: round(float(p), 4)
                for cls, p in zip(risk_classes, proba)
            },
        }

    def get_metrics(self) -> dict:
        """Get model performance metrics."""
        if not self.model_bundle:
            return {"error": "Model yüklenmedi."}

        return {
            "version": self.model_bundle.get("version", "unknown"),
            "training_rows": self.model_bundle.get("training_rows", 0),
            "demand_metrics": self.model_bundle.get("demand_metrics", {}),
            "risk_metrics": self.model_bundle.get("risk_metrics", {}),
            "classification_report": self.model_bundle.get("classification_report", {}),
        }


# Singleton instance
prediction_service = PredictionService()
