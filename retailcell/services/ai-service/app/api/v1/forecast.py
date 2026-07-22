"""
RetailCell AI Service - Forecast & Risk Endpoints
"""
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import Optional

from app.ml.predict import prediction_service

router = APIRouter(prefix="/ai", tags=["🤖 YZ Öngörüleri"])


class ForecastRequest(BaseModel):
    category: str = Field(default="PHONE", description="Ürün kategorisi")
    region: str = Field(default="İstanbul")
    price: float = Field(default=5000.0, gt=0)
    stock_level: int = Field(default=50, ge=0)
    reorder_level: int = Field(default=10, ge=0)
    is_promotion: int = Field(default=0, ge=0, le=1)
    day_of_week: int = Field(default=1, ge=0, le=6)
    month: int = Field(default=6, ge=1, le=12)
    avg_daily_sales_7d: float = Field(default=5.0, ge=0)
    avg_daily_sales_30d: float = Field(default=4.0, ge=0)
    days_since_last_restock: int = Field(default=10, ge=0)
    supplier_lead_time_days: int = Field(default=5, ge=1)


class ForecastResponse(BaseModel):
    predicted_demand: float
    confidence_lower: float
    confidence_upper: float


class RiskResponse(BaseModel):
    risk_level: str
    risk_score: float
    probabilities: dict


class MetricsResponse(BaseModel):
    version: str
    training_rows: int
    demand_metrics: dict
    risk_metrics: dict
    classification_report: Optional[dict] = None


@router.post("/forecast", response_model=ForecastResponse, summary="Talep Tahmini")
async def forecast_demand(request: ForecastRequest):
    """Belirtilen parametreler için talep tahmini yapın."""
    result = prediction_service.predict_demand(
        category=request.category,
        region=request.region,
        price=request.price,
        stock_level=request.stock_level,
        reorder_level=request.reorder_level,
        is_promotion=request.is_promotion,
        day_of_week=request.day_of_week,
        month=request.month,
        avg_7d=request.avg_daily_sales_7d,
        avg_30d=request.avg_daily_sales_30d,
        days_since_restock=request.days_since_last_restock,
        lead_time=request.supplier_lead_time_days,
    )
    return ForecastResponse(**result)


@router.post("/risk", response_model=RiskResponse, summary="Stok Risk Analizi")
async def classify_risk(request: ForecastRequest):
    """Stok tükenme riski sınıflandırması yapın."""
    result = prediction_service.predict_risk(
        category=request.category,
        region=request.region,
        price=request.price,
        stock_level=request.stock_level,
        reorder_level=request.reorder_level,
        is_promotion=request.is_promotion,
        day_of_week=request.day_of_week,
        month=request.month,
        avg_7d=request.avg_daily_sales_7d,
        avg_30d=request.avg_daily_sales_30d,
        days_since_restock=request.days_since_last_restock,
        lead_time=request.supplier_lead_time_days,
    )
    return RiskResponse(**result)


@router.get("/accuracy", response_model=MetricsResponse, summary="Model Doğruluk Metrikleri")
async def get_accuracy():
    """Model performans metriklerini alın (R², MAE, RMSE, Accuracy, F1)."""
    return MetricsResponse(**prediction_service.get_metrics())


@router.post("/retrain", summary="Modeli Yeniden Eğit")
async def retrain_model():
    """ML modelini yeniden eğitin."""
    from app.ml.train import train_models
    result = train_models()
    prediction_service.reload_model()
    return {
        "message": "Model başarıyla yeniden eğitildi.",
        "version": result.get("version"),
        "training_rows": result.get("training_rows"),
        "demand_metrics": result.get("demand_metrics"),
        "risk_metrics": result.get("risk_metrics"),
    }
