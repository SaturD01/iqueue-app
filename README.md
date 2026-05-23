# iQueue — Smart Bank Queue Management System

> Eliminates physical bank queues through digital token booking, real-time tracking, and AI-powered staffing insights.

---

## Project Info

| Field | Details |
|-------|---------|
| Course | CIT310 — Information Technology Project |
| Group | Batch 07 · Group 19 · Project ID: CIT310_01_26_19 |
| University | SLTC Research University |
| Year | 2026 |
| Supervisors | Ms. Nilupuli · Ms. Nadeesha |
| Repository | https://github.com/SaturD01/iqueue-app |

---

## Team

| Member | Role | Student ID | Owns |
|--------|------|-----------|------|
| WDD Wickramaratne | M1 — Technical Lead | 22UG3-0550 | Backend infrastructure, JWT auth, Email, Cron, Claude AI, AWS deployment, Tracker page |
| IMT Ilangasinghe | M4 — Technical Member | TBC | MongoDB Atlas, All schemas, All API routes, Socket.io, Admin Panel |
| TG Dhanushi Uttara | M2 — Frontend Developer | TBC | Register, Login, Booking pages |
| RVS Premarathna | M3 — Frontend Developer | TBC | Staff Panel, TV Display, Manager Dashboard |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Token (JWT), bcryptjs |
| Real-time | Socket.io (Phase 2) |
| AI | Claude API by Anthropic |
| Email | Nodemailer with Gmail SMTP |
| Scheduling | node-cron |
| Deployment | AWS EC2 (backend), AWS Amplify (frontend) — Phase 3 |

---

## Features

- **Multi-role authentication** — customer, staff, manager, admin
- **Virtual token booking** — with arrival-hold so customers are never unfairly marked no-show while travelling
- **Independent counter queues** — Counter 1 (Cash), Counter 2 (Accounts), Counter 3 (Loans and Inquiry)
- **Live Queue Tracker** — 6 token statuses with colour coding and 5-minute countdown timer
- **Automated no-show detection** — cron scheduler marks CALLED tokens as NO_SHOW after 5 minutes
- **Email notifications** — booking confirmation and your-turn alerts via Gmail SMTP
- **Priority token system** — VIP and elderly customers go to front of queue
- **AI staffing recommendations** — Claude API analyses hourly stats
- **AI no-show risk prediction** — flags HIGH, MEDIUM, LOW risk per customer
- **AI smart notification timing** — calculates optimal position to notify customer
- **Star rating system** — after service completion
- **Public TV display** — 3 counter panels, token numbers only (no personal data shown)
- **Manager analytics dashboard** — Recharts bar and line charts
- **Admin user management** — role and branch assignment

---

## Current Build Status

| Feature | Status | Owner | Notes |
|---------|--------|-------|-------|
| Express server + JWT auth | ✅ Complete | M1 — Wickramaratne | Tested with real MongoDB |
| Role-based access control | ✅ Complete | M1 — Wickramaratne | 4 roles enforced |
| Email service (Nodemailer) | ✅ Complete | M1 — Wickramaratne | Gmail SMTP tested |
| node-cron no-show scheduler | ✅ Complete | M1 — Wickramaratne | 60s interval, tested |
| Claude AI module (3 outputs) | ✅ Complete | M1 — Wickramaratne | Privacy rule enforced |
| Admin API routes | ✅ Complete | M1 — Wickramaratne | GET and PATCH users |
| Seed script | ✅ Complete | M1 — Wickramaratne | 3 branches, 3 test users |
| MongoDB Atlas setup | ✅ Complete | M4 — Ilangasinghe | Atlas connected |
| MongoDB config (db.js) | ✅ Complete | M4 — Ilangasinghe | Mongoose connection |
| All 5 Mongoose schemas | ✅ Complete | M4 — Ilangasinghe | User, Token, Branch, Stats, Rating |
| Branch API route | ✅ Complete | M4 — Ilangasinghe | GET /api/branches tested |
| Token API routes (7 endpoints) | ✅ Complete | M4 — Ilangasinghe | Full queue flow tested |
| Analytics API routes | ✅ Complete | M4 — Ilangasinghe | Summary and hourly |
| Rating API route | ✅ Complete | M4 — Ilangasinghe | POST /api/ratings tested |
| Live Queue Tracker page | ✅ Complete | M1 — Wickramaratne | 6 statuses, countdown, star rating |
| Register page | ✅ Complete | M2 — Dhanushi | Validation, success screen |
| Login page | ✅ Complete | M2 — Dhanushi | Error handling, loading state |
| Booking page | ✅ Complete | M2 — Dhanushi | Banking hours enforced, instructions |
| Staff Panel page | ✅ Complete | M3 — Premarathna | 3 independent counter queues |
| TV Display page | ✅ Complete | M3 — Premarathna | 3 counter panels, privacy-first |
| Manager Dashboard | ✅ Complete | M3 — Premarathna | Recharts charts, AI button |
| Socket.io real-time engine | ⏳ In Progress | M4 — Ilangasinghe | Phase 2 |
| Frontend API wiring | ⏳ In Progress | M2, M3, M1 | Phase 2 |
| Admin Panel page | ⏳ In Progress | M4 — Ilangasinghe | Phase 2 |
| AWS Deployment | 🔲 Pending | M1 — Wickramaratne | Phase 3 |
| Integration testing | 🔲 Pending | M1 — Wickramaratne | Phase 3 |
| UI redesign with dark mode | 🔲 Pending | All members | Phase 3 |

---

## Overall Progress

```
Backend Infrastructure  ████████████████████  95%
Frontend Pages          ████████████████████ 100%
Database Layer          ████████████████░░░░  80%
API Routes              █████████████████░░░  85%
Real-time Engine        ░░░░░░░░░░░░░░░░░░░░   0%
Deployment              ░░░░░░░░░░░░░░░░░░░░   0%

Overall: ~75%
```

---

## Tested API Endpoints

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET | `/` | None | ✅ Tested |
| POST | `/api/auth/register` | None | ✅ Tested |
| POST | `/api/auth/login` | None | ✅ Tested — all 4 roles |
| GET | `/api/branches` | None | ✅ Tested |
| POST | `/api/tokens` | Customer JWT | ✅ Tested |
| GET | `/api/tokens/my` | Customer JWT | ✅ Tested |
| POST | `/api/tokens/call-next` | Staff JWT | ✅ Tested |
| PATCH | `/api/tokens/:id/served` | Staff JWT | ✅ Tested |
| PATCH | `/api/tokens/:id/no-show` | Staff JWT | ✅ Tested |
| POST | `/api/ratings` | Customer JWT | ✅ Tested |
| GET | `/api/analytics/summary` | Manager JWT | ✅ Tested |
| GET | `/api/analytics/hourly` | Manager JWT | ✅ Tested |
| GET | `/api/admin/users` | Admin JWT | ✅ Tested |
| PATCH | `/api/admin/users/:id` | Admin JWT | ✅ Tested |

---

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/SaturD01/iqueue-app.git
cd iqueue-app
```

**2. Set up environment variables**
```bash
cp .env.example backend/.env
# Fill in values — ask M1 for MongoDB URI and API keys
```

**3. Install dependencies**
```bash
cd backend && npm install
cd ../frontend && npm install && npm install recharts
```

**4. Seed the database**
```bash
cd backend && node scripts/seed.js
```

**5. Start backend**
```bash
cd backend && npm run dev
# Expected: MongoDB Atlas connected | Server on port 5000
```

**6. Start frontend**
```bash
cd frontend && npm run dev
# Expected: Ready on http://localhost:3000
```

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@iqueue.app | admin123456 |
| Staff | staff@iqueue.app | staff123456 |
| Manager | manager@iqueue.app | manager123456 |
| Customer | Register via /register | — |

---

## Working Pages

| URL | Page | Owner | Status |
|-----|------|-------|--------|
| /register | Customer Registration | M2 — Dhanushi | ✅ Working |
| /login | Customer Login | M2 — Dhanushi | ✅ Working |
| /booking | Token Booking | M2 — Dhanushi | ✅ Working |
| /tracker | Live Queue Tracker | M1 — Wickramaratne | ✅ Working |
| /staff | Staff Queue Panel | M3 — Premarathna | ✅ Working |
| /tv | Public TV Display | M3 — Premarathna | ✅ Working |
| /dashboard | Manager Dashboard | M3 — Premarathna | ✅ Working |

---

## Project Structure

```
iqueue-app/
├── backend/
│   ├── config/          MongoDB connection
│   ├── middleware/       JWT auth and role guards
│   ├── models/          Mongoose schemas (User, Token, Branch, Stats, Rating)
│   ├── routes/          API route handlers (auth, admin, branch, token, analytics, rating)
│   └── services/        Email, cron, Claude AI
├── frontend/
│   ├── app/             Next.js App Router pages
│   ├── components/      Reusable React components
│   └── lib/             Axios instance and utilities
├── .github/
│   └── pull_request_template.md
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

---

## Branch Strategy

All work happens on feature branches. Nothing goes directly to main.
Every change requires a Pull Request reviewed and approved by M1 before merging.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

---

## Data Privacy

The Claude AI module **never** receives customer names, email addresses, or phone numbers.
Only anonymised token IDs, aggregate counts, and statistical averages are sent to the Anthropic API.

---

## Counter Assignment

| Counter | Services Handled |
|---------|-----------------|
| Counter 1 — Cash Services | Cash Deposit, Document Submission |
| Counter 2 — Account Services | Account Opening, Card Services |
| Counter 3 — Loans and Inquiry | Loan Inquiry, General Inquiry |

Each counter operates an independent queue. Call Next only affects the selected counter.

---

