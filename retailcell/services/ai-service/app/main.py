"""
RetailCell AI Service
FastAPI application for ML-based demand forecasting and risk analysis.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings

settings = get_settings()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger(settings.SERVICE_NAME)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 {settings.SERVICE_NAME} başlatılıyor...")
    # Generate dataset and train model on startup if needed
    from app.ml.predict import prediction_service
    if not prediction_service.model_bundle:
        logger.info("📊 Model eğitiliyor...")
        from app.ml.train import train_models
        train_models()
        prediction_service.reload_model()
    logger.info(f"✅ {settings.SERVICE_NAME} hazır! Port: {settings.SERVICE_PORT}")
    yield
    logger.info(f"🛑 {settings.SERVICE_NAME} kapatılıyor...")


app = FastAPI(
    title="RetailCell AI Service",
    description="""
## 🤖 Yapay Zeka Öngörü API

Scikit-Learn tabanlı talep tahmini ve stok risk analizi servisi.

### Özellikler
- **Talep Tahmini** — RandomForestRegressor ile ürün talep tahmini
- **Risk Sınıflandırma** — GradientBoostingClassifier ile stok tükenme riski
- **Model Metrikleri** — R², MAE, RMSE, Accuracy, F1 Score
- **Yeniden Eğitim** — Model yeniden eğitme endpoint'i
- **Sentetik Veri** — 150+ satır eğitim verisi
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1.forecast import router as forecast_router
app.include_router(forecast_router, prefix="/api/v1")


@app.get("/health", tags=["🏥 Sağlık Kontrolü"])
async def health_check():
    return {"service": settings.SERVICE_NAME, "status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.SERVICE_PORT, reload=settings.DEBUG)
