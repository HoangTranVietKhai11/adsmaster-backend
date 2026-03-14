<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Python-FastAPI-blue?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/SQLite-Prisma-003B57?style=for-the-badge&logo=sqlite" />
  <img src="https://img.shields.io/badge/Google-Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google-gemini" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe" />
</p>

<h1 align="center">⚡ AdsMaster AI SaaS</h1>

<p align="center">
  <strong>Learn, Build, Analyze and Scale Facebook Ads with AI.</strong><br/>
  Production-ready AI-powered Marketing SaaS Platform
</p>

---

## 🚀 What is AdsMaster AI?

AdsMaster AI is a **full-stack SaaS platform** for Facebook Ads marketers:

| Module | Description |
|--------|-------------|
| 🎓 **Learning Platform** | Expert-curated Facebook Ads courses |
| 🤖 **AI Ads Generator** | Gemini 2.5 Flash-powered ad copy in seconds |
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
| **Frontend** | Next.js 14, React, TypeScript, TailwindCSS, ShadCN |
| **Backend** | Node.js, Express.js, TypeScript |
| **AI Engine** | Python, FastAPI, Pandas (Analytics) |
| **Database** | SQLite + Prisma ORM (Setup for single-user/server simplicity) |
| **AI** | Google Gemini 2.5 Flash (via OpenAI SDK) |
| **Payments** | Stripe API |
| **Auth** | JWT + Refresh Tokens, bcrypt |

---

## ⚡ Quick Start

### 1. Cấu hình Environment
Copy file `.env.example` thành `.env` và điền các key quan trọng:
- `DATABASE_URL=file:./dev.db`
- `OPENAI_API_KEY`: Điền Gemini API Key từ [Google AI Studio](https://aistudio.google.com/apikey).
- `OPENAI_MODEL=gemini-2.5-flash`

### 2. Chạy ứng dụng

**Backend:**
```bash
cd backend
npm install
npx prisma generate --schema=../database/prisma/schema.prisma
npx prisma db push --schema=../database/prisma/schema.prisma
npm run dev
# → Chạy tại http://localhost:4005
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → Chạy tại http://localhost:3000
```

### 3. Start AI Analysis Engine
The AI Analysis service is built with Python/FastAPI and provides backend logic for ad recommendations.

```bash
# Using the provided script (Windows)
./run_ai.ps1

# Or manually
cd ai-engine
python -m venv venv
./venv/Scripts/activate
pip install -r requirements.txt
python -m uvicorn main:app --port 8001 --reload
```

---

## 🛠 Features Summary

### 1. Đăng nhập
Sử dụng tài khoản Demo đã được tạo sẵn:
- **Email:** `demo@adsmaster.ai`
- **Password:** `Demo@12345`

*Nếu chưa có dữ liệu, hãy chạy lệnh seed: `cd backend && npm run db:seed`*

### 2. AI Ads Generator (Sức mạnh Gemini)
- Truy cập menu **AI Generator** ở sidebar.
- Nhập tên sản phẩm, đối tượng khách hàng và lợi ích chính.
- Nhấn **Generate Ad Copy**.
- Hệ thống sẽ dùng Gemini 2.5 Flash để sinh ra tiêu đề, nội dung quảng cáo, ý tưởng hình ảnh và mẹo nhắm mục tiêu (targeting tip) chuẩn xác.

### 3. Dashboard & Analytics
- Trang chủ hiển thị tổng quan các chỉ số (Impressions, Clicks, Spend, ROAS).
- Nút **Generate AI Insights** ở góc phải dashboard sẽ phân tích dữ liệu chiến dịch hiện tại và đưa ra lời khuyên tối ưu.

### 4. Learning Platform
- Khám phá các khóa học Facebook Ads tại menu **Courses**.
- Học viên có thể xem lộ trình, nội dung bài học và tiến độ hoàn thành.

---

## 👤 Tài khoản mặc định (sau khi Seed)

| Vai trò | Email | Mật khẩu |
|------|-------|----------|
| Admin | `admin@adsmaster.ai` | `Admin@12345` |
| Demo User | `demo@adsmaster.ai` | `Demo@12345` |

---

<p align="center">Built with ❤️ for Facebook Ads marketers everywhere</p>

