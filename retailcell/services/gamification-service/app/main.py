"""
RetailCell Gamification Service
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db.database import init_db, close_db

settings = get_settings()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger(settings.SERVICE_NAME)


async def seed_badges(db_session):
    """Seed default badges."""
    from app.db.models import Badge
    from sqlalchemy import select

    async with db_session() as session:
        existing = await session.execute(select(Badge).limit(1))
        if existing.scalar_one_or_none():
            return

        badges = [
            Badge(name="sla_champion", display_name="SLA Şampiyonu", description="5 talep SLA süresi içinde teslim edildi", category="SLA", points=100, criteria={"sla_on_time": 5}),
            Badge(name="fast_responder", display_name="Hızlı Yanıtçı", description="İlk yanıt süresi 1 saatten az", category="PERFORMANCE", points=75, criteria={"first_response_hours": 1}),
            Badge(name="perfect_stock", display_name="Mükemmel Stok", description="30 gün boyunca stok tükenme yok", category="STOCK", points=150, criteria={"no_stockout_days": 30}),
            Badge(name="top_dealer", display_name="En İyi Bayi", description="Ayın en yüksek puanlı bayisi", category="PERFORMANCE", points=200, criteria={"monthly_top": True}),
            Badge(name="delivery_star", display_name="Teslimat Yıldızı", description="10 teslimat zamanında tamamlandı", category="DELIVERY", points=120, criteria={"on_time_deliveries": 10}),
            Badge(name="risk_buster", display_name="Risk Avcısı", description="5 yüksek riskli ürün sorunsuz yönetildi", category="STOCK", points=130, criteria={"high_risk_managed": 5}),
            Badge(name="first_supply", display_name="İlk Tedarik", description="İlk tedarik talebini oluşturdu", category="SPECIAL", points=25, criteria={"first_supply_request": True}),
            Badge(name="hundred_club", display_name="100 Puan Kulübü", description="Toplam 100 puana ulaşıldı", category="SPECIAL", points=50, criteria={"total_points": 100}),
        ]

        for badge in badges:
            session.add(badge)
        await session.commit()
        logger.info("✅ Varsayılan rozetler oluşturuldu.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 {settings.SERVICE_NAME} başlatılıyor...")
    await init_db()
    from app.db.database import async_session
    await seed_badges(async_session)
    logger.info(f"✅ {settings.SERVICE_NAME} hazır! Port: {settings.SERVICE_PORT}")
    yield
    await close_db()


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
