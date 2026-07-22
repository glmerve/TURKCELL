"""
RetailCell Inventory Service
FastAPI application for product management, supply requests, and cases.
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
    try:
        from app.db.database import init_db
        await init_db()
    except Exception as e:
        logger.warning(f"⚠️ DB bağlantısı atlandı (Swagger Modu): {e}")
    logger.info(f"✅ {settings.SERVICE_NAME} hazır! Port: {settings.SERVICE_PORT}")
    yield
    logger.info(f"🛑 {settings.SERVICE_NAME} kapatılıyor...")


app = FastAPI(
    title="RetailCell Inventory Service",
    description="""
## 📦 Envanter & Tedarik Yönetimi API

Ürün yönetimi, tedarik talepleri, SLA takibi ve bölgesel vaka yönetimi.

### Özellikler
- **Ürün CRUD** — Stok takibi, kategori yönetimi
- **Tedarik Talepleri** — Durum makinesi ile yaşam döngüsü yönetimi
- **SLA Hesaplama** — Otomatik süre takibi ve ihlal tespiti
- **Dashboard** — Gerçek zamanlı istatistikler
- **Bölgesel Vakalar** — Vaka oluşturma ve takip
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

from app.api.v1.products import router as products_router
from app.api.v1.supply_requests import router as supply_requests_router
from app.api.v1.dashboard import router as dashboard_router

app.include_router(products_router, prefix="/api/v1")
app.include_router(supply_requests_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")


@app.get("/health", tags=["🏥 Sağlık Kontrolü"])
async def health_check():
    return {"service": settings.SERVICE_NAME, "status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.SERVICE_PORT, reload=settings.DEBUG)
