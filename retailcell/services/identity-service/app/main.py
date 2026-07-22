"""
RetailCell Identity Service
FastAPI application for authentication, user management, and audit logging.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.models import User
from app.core.password import hash_password

settings = get_settings()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
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
    title="RetailCell Identity Service",
    description="""
## 🔐 Kimlik Doğrulama & Kullanıcı Yönetimi API

RetailCell platformunun kimlik doğrulama, yetkilendirme ve kullanıcı yönetimi servisi.

### Özellikler
- **JWT Kimlik Doğrulama** — Access Token (15dk) + Refresh Token (7 gün)
- **Rol Bazlı Yetkilendirme** — Admin, Manager, Viewer, Dealer
- **Kullanıcı Yönetimi** — CRUD operasyonları
- **Denetim Günlükleri** — Tüm önemli işlemler kayıt altında
- **bcrypt Şifre Hashleme** — Güvenli şifre saklama

### Varsayılan Admin
- **Email:** admin@retailcell.com
- **Şifre:** Admin123!
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

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.audit import router as audit_router

app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(audit_router, prefix="/api/v1")


@app.get("/health", tags=["🏥 Sağlık Kontrolü"])
async def health_check():
    return {
        "service": settings.SERVICE_NAME,
        "status": "healthy",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.SERVICE_PORT,
        reload=settings.DEBUG,
    )
