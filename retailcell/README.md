# 🏪 RetailCell — Bayi Envanter Yönetim Platformu

Gerçek zamanlı tedarik zinciri optimizasyonu için YZ destekli Bayi Envanter Yönetim Platformu.

## 🏗️ Mimari

RetailCell, mikroservis mimarisi üzerine inşa edilmiş bir platformdur:

| Servis | Port | Açıklama |
|--------|------|----------|
| **API Gateway** (Nginx) | 8080 | Tek giriş noktası, reverse proxy |
| **Identity Service** | 8001 | Kimlik doğrulama, JWT, kullanıcı yönetimi |
| **Inventory Service** | 8002 | Envanter, tedarik talepleri, vakalar |
| **AI Service** | 8003 | Talep tahmini, risk analizi (Scikit-Learn) |
| **Gamification Service** | 8004 | Rozet, puan, liderlik tablosu |
| **Frontend** (Next.js) | 3000 | Web Dashboard |

## 🛠️ Teknoloji Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy (async), Pydantic
- **Frontend:** Next.js 14, React, Recharts, React-Leaflet
- **Veritabanı:** PostgreSQL 16 (Railway), Redis 7 (cache)
- **Event Bus:** Apache Kafka / Redis Streams
- **Auth:** JWT (Access + Refresh Token), bcrypt (Passlib)
- **AI/ML:** Scikit-Learn, Pandas, NumPy
- **DevOps:** Docker, Docker Compose, GitHub Actions, Railway

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Docker & Docker Compose
- Node.js 20+ (frontend geliştirme)
- Python 3.12+ (backend geliştirme)

### Kurulum

```bash
# 1. Repoyu klonlayın
git clone https://github.com/your-username/retailcell.git
cd retailcell

# 2. Ortam değişkenlerini ayarlayın
cp .env.example .env

# 3. Tüm sistemi başlatın
docker compose up --build

# 4. Swagger UI'ya erişin
# Identity:    http://localhost:8001/docs
# Inventory:   http://localhost:8002/docs
# AI:          http://localhost:8003/docs
# Gamification: http://localhost:8004/docs

# 5. Frontend'e erişin
# http://localhost:3000
```

### Veritabanı Migrasyonu

```bash
# Prisma migrasyonu oluştur
npx prisma migrate dev --name init

# Veritabanını sıfırla
npx prisma migrate reset
```

## 📁 Proje Yapısı

```
retailcell/
├── .github/workflows/         # CI/CD Pipeline
├── docs/                      # Dokümantasyon
├── prisma/                    # Veritabanı şeması
├── services/
│   ├── api-gateway/           # Nginx API Gateway
│   ├── identity-service/      # Kimlik Servisi
│   ├── inventory-service/     # Envanter Servisi
│   ├── ai-service/            # AI Servisi
│   └── gamification-service/  # Gamification Servisi
├── frontend/                  # Next.js Dashboard
├── docker-compose.yml
├── railway.json
└── README.md
```

## 📖 API Dokümantasyonu

Tüm API'ler Swagger (OpenAPI) ile otomatik olarak dokümante edilmiştir:

- **Identity Service:** `/docs` veya `/redoc`
- **Inventory Service:** `/docs` veya `/redoc`
- **AI Service:** `/docs` veya `/redoc`
- **Gamification Service:** `/docs` veya `/redoc`

## 🧪 Testler

```bash
# Identity Service testleri
cd services/identity-service && pytest tests/ -v

# Inventory Service testleri
cd services/inventory-service && pytest tests/ -v

# AI Service testleri
cd services/ai-service && pytest tests/ -v

# Gamification Service testleri
cd services/gamification-service && pytest tests/ -v
```

## 🚂 Railway Deployment

Proje Railway üzerinde multi-service olarak deploy edilir. Her servis kendi Railway servisi olarak çalışır.

## 📄 Lisans

Bu proje Turkcell CodeNight hackathon'u için geliştirilmiştir.
