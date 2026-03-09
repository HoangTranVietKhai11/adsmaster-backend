<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Python-FastAPI-blue?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma-blue?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe" />
</p>

<h1 align="center">⚡ AdsMaster AI SaaS</h1>

<p align="center">
  <strong>Learn, Build, Analyze and Scale Facebook Ads with AI.</strong><br/>
  Production-ready AI-powered Marketing SaaS Platform
</p>

---

## 🚀 What is AdsMaster AI?

AdsMaster AI is a **full-stack SaaS platform** that combines:

| Module | Description |
|--------|-------------|
| 🎓 **Learning Platform** | Expert-curated Facebook Ads courses |
| 🤖 **AI Ads Generator** | GPT-4-powered ad copy in seconds |
| 🏗️ **Campaign Builder** | Visual drag-and-drop campaign creator |
| 📊 **AI Analytics** | Pandas-based CTR/CPA/ROAS analysis |
| 🔗 **Affiliate System** | 30% recurring commission tracking |
| 👥 **CRM** | Lead management & interaction log |
| 🛡️ **Admin Dashboard** | Full platform management |
| 💳 **Stripe Billing** | Free / Pro $19 / Agency $49 plans |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React, TypeScript, TailwindCSS, ShadCN, Framer Motion |
| **Backend** | Node.js, Express.js, TypeScript |
| **AI Engine** | Python, FastAPI, Pandas, NumPy, scikit-learn |
| **Database** | PostgreSQL + Prisma ORM |
| **Cache/Queue** | Redis, BullMQ |
| **AI** | OpenAI GPT-4 |
| **Payments** | Stripe API |
| **Storage** | AWS S3 compatible |
| **Auth** | JWT + Refresh Tokens, bcrypt |
| **DevOps** | Docker, Nginx, GitHub Actions |

---

## 📁 Project Structure

```
adsmaster-ai-saas/
├── frontend/                    # Next.js 14 frontend
│   ├── app/
│   │   ├── (auth)/             # Login, Register pages
│   │   └── (dashboard)/        # All dashboard pages
│   ├── components/
│   └── lib/
├── backend/                     # Express.js API
│   └── src/
│       ├── modules/            # Auth, Campaigns, Analytics, AI, etc.
│       ├── config/             # DB, Redis, Stripe, OpenAI
│       └── middlewares/        # JWT, RBAC, rate limiting
├── ai-engine/                   # Python FastAPI microservice
│   ├── analytics/              # Pandas-based ad analyzer
│   ├── prediction/             # Performance predictor
│   └── recommendation/        # Optimization recommendations
├── database/
│   ├── prisma/schema.prisma    # Full PostgreSQL schema (17 tables)
│   └── seed/seed.ts            # Database seeder
├── docker/                      # Dockerfiles
├── nginx/nginx.conf             # Reverse proxy
└── .github/workflows/           # GitHub Actions CI/CD
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### 1. Clone & Configure

```bash
git clone https://github.com/your-username/adsmaster-ai-saas.git
cd adsmaster-ai-saas

# Copy environment file
cp .env.example .env
# Edit .env with your keys (OpenAI, Stripe, DB credentials)
```

### 2. Docker (Recommended)

```bash
# Start all services
docker compose -f docker/docker-compose.yml up -d

# Run database migrations + seed
docker exec adsmaster_backend npx prisma migrate deploy
docker exec adsmaster_backend npm run db:seed

# Open: http://localhost (via Nginx)
# Direct: http://localhost:3000 (frontend)
# API: http://localhost:4000/api
# AI Engine: http://localhost:8000
```

### 3. Local Development

```bash
# ── Backend ─────────────────────────
cd backend
npm install
npx prisma generate --schema=../database/prisma/schema.prisma
npx prisma migrate dev --schema=../database/prisma/schema.prisma
npm run dev
# → http://localhost:4000

# ── AI Engine ────────────────────────
cd ai-engine
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000

# ── Frontend ─────────────────────────
cd frontend
npm install
npm run dev
# → http://localhost:3000

# ── Seed database ─────────────────────
cd backend && npm run db:seed
```

---

## 🔑 Environment Variables

See [`.env.example`](.env.example) for all required variables.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` | JWT signing secret (access token) |
| `JWT_REFRESH_SECRET` | JWT signing secret (refresh token) |
| `OPENAI_API_KEY` | OpenAI API key (GPT-4) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan |
| `STRIPE_AGENCY_PRICE_ID` | Stripe price ID for Agency plan |
| `AWS_ACCESS_KEY_ID` | AWS S3 access key |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 secret key |

---

## 🗄️ Database Schema

17 PostgreSQL tables managed by Prisma:

```
users → plans → subscriptions → payments
       ↓
campaigns → adsets → ads → metrics
       ↓
courses → modules → lessons → enrollments → lesson_progress
       ↓
affiliates → referrals
       ↓
leads → crm_interactions
       ↓
ai_recommendations | analytics_reports | notifications
```

---

## 🔌 API Endpoints

| Module | Endpoints |
|--------|----------|
| **Auth** | `POST /api/auth/register`, `/api/auth/login`, `/api/auth/refresh` |
| **Campaigns** | `GET/POST /api/campaigns`, `PUT/DELETE /api/campaigns/:id` |
| **Analytics** | `GET /api/analytics/dashboard`, `/api/analytics/reports` |
| **AI** | `POST /api/ai/generate-ad`, `/api/ai/analyze-audience` |
| **Courses** | `GET /api/courses`, `POST /api/courses/:id/enroll` |
| **Affiliates** | `GET /api/affiliates/dashboard`, `POST /api/affiliates/join` |
| **Payments** | `POST /api/payments/subscribe`, `/api/payments/cancel` |
| **CRM** | `GET/POST /api/crm`, `POST /api/crm/:id/interactions` |
| **Admin** | `GET /api/admin/stats`, `/api/admin/users`, `/api/admin/payments` |
| **Notifications** | `GET /api/notifications`, `PUT /api/notifications/read-all` |

---

## 🤖 AI Analytics Engine

The Python microservice analyzes ad metrics using:

- **CTR Analysis** — Detects low click-through rates vs. industry benchmarks
- **CPA Analysis** — Flags high cost-per-acquisition
- **ROAS Analysis** — Alerts on below-breakeven return on ad spend
- **Creative Fatigue** — Detects high frequency (audience fatigue)
- **Performance Prediction** — Linear regression trend analysis
- **Recommendations** — Severity-ranked actionable suggestions

```bash
# Analyze ads
POST http://localhost:8000/analyze
{ "user_id": "...", "metrics": [...] }

# Predict performance
POST http://localhost:8000/predict-performance
```

---

## 💳 Subscription Plans

| Plan | Price | Campaigns | AI Credits |
|------|-------|-----------|------------|
| Free | $0/mo | 3 | 10/mo |
| Pro | $19/mo | 20 | 100/mo |
| Agency | $49/mo | Unlimited | 500/mo |

---

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80, 443 | Reverse proxy |
| frontend | 3000 | Next.js app |
| backend | 4000 | Express API |
| ai-engine | 8000 | FastAPI analytics |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Cache & queues |

---

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci-cd.yml`):

1. **Test** — TypeScript check, Python syntax validation
2. **Build** — Multi-stage Docker image builds (frontend, backend, ai)
3. **Push** — Push to GitHub Container Registry (GHCR)
4. **Deploy** — SSH deployment to production server

---

## 👤 Default Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@adsmaster.ai` | `Admin@12345` |
| Demo User | `demo@adsmaster.ai` | `Demo@12345` |

---

## 📖 License

MIT License — free to use, modify, and deploy.

---

<p align="center">Built with ❤️ for Facebook Ads marketers everywhere</p>
