"""
RetailCell Gamification Service
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
        from app.db.database import init_db, async_session
        await init_db()
    except Exception as e:
        logger.warning(f"⚠️ DB bağlantısı atlandı (Swagger Modu): {e}")
    logger.info(f"✅ {settings.SERVICE_NAME} hazır! Port: {settings.SERVICE_PORT}")
    yield


app = FastAPI(
    title="RetailCell Gamification Service",
    description="""
## 🏆 Oyunlaştırma API

Rozet, puan ve liderlik tablosu yönetimi.

### Özellikler
- **Rozet Sistemi** — SLA Şampiyonu, Hızlı Yanıtçı, Mükemmel Stok vb.
- **Puan Motoru** — Teslimat, SLA uyumu bazlı puan
- **Liderlik Tablosu** — Bölge bazlı sıralama
- **Profil** — Kullanıcı rozet ve puan geçmişi
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

from app.api.v1.gamification import router as gamification_router
app.include_router(gamification_router, prefix="/api/v1")


@app.get("/health", tags=["🏥 Sağlık Kontrolü"])
async def health_check():
    return {"service": settings.SERVICE_NAME, "status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.SERVICE_PORT, reload=settings.DEBUG)
