# iQueue — Smart Bank Queue Token Management System

> Eliminates physical bank queues for Sri Lankan bank branches through digital token booking, real-time tracking, and AI-powered staffing insights.

## Project Info

- **Course:** CIT310 — Information Technology Project
- **Group:** Batch 07 · Group 19 · Project ID: CIT310_01_26_19
- **University:** SLTC Research University
- **Year:** 2026
- **Supervisors:** Ms. Nilupuli · Ms. Nadeesha

## Team

| Member | Role | Owns |
|--------|------|------|
| WDD Wickramaratne | M1 — Architecture and Backend | Backend core, JWT auth, Email, Cron, AWS deployment, Tracker page |
| TG Dhanushi Uttara | M2 — Solution and UX | Register, Login, Booking, Tracker pages |
| RVS Premarathna | M3 — Features and Planning | Staff Panel, TV Display, Manager Dashboard |
| IMT Ilangasinghe | M4 — AI and Integration | Claude AI module, MongoDB, All API routes, Socket.io |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, Tailwind CSS, Socket.io Client, Recharts |
| Backend | Node.js, Express, MongoDB Atlas, Mongoose |
| Real-time | Socket.io, MongoDB Change Streams |
| AI | Claude API by Anthropic |
| Email | Nodemailer with Gmail SMTP |
| Scheduling | node-cron |
| Deployment | AWS EC2 (backend), AWS Amplify (frontend) |

## Features

- Multi-role authentication — customer, staff, manager, admin, public TV display
- Virtual token booking with arrival-hold (no unfair no-shows while in transit)
- Real-time queue tracker — updates in under 2 seconds without page refresh
- Automated email notifications — booking confirmation and your turn alerts
- 5-minute auto no-show scheduler
- Priority token for VIP and elderly walk-in customers
- AI-powered staffing recommendations (Claude API)
- AI-powered no-show risk prediction per customer (Claude API)
- AI-powered smart notification timing (Claude API)
- Star rating system after service
- Public TV display screen — no login required
- Manager analytics dashboard with Recharts charts

## Current Build Status

| Feature | Status | Owner | Branch |
|---------|--------|-------|--------|
| Express server + JWT auth | ✅ Complete | M1 — Wickramaratne | feature/backend-core |
| Email service (Nodemailer) | ✅ Complete | M1 — Wickramaratne | feature/backend-core |
| node-cron no-show scheduler | ✅ Complete | M1 — Wickramaratne | feature/backend-core |
| Claude AI module (3 outputs) | ✅ Complete | M1 — Wickramaratne | feature/backend-core |
| Live Queue Tracker page | ✅ Complete | M1 — Wickramaratne | feature/tracker-page |
| MongoDB schemas | ⏳ In Progress | M1 — Wickramaratne | feature/backend-core |
| MongoDB Atlas setup | ⏳ In Progress | M4 — Ilangasinghe | feature/token-api |
| Token API routes | ⏳ In Progress | M4 — Ilangasinghe | feature/token-api |
| Socket.io real-time engine | ⏳ In Progress | M4 — Ilangasinghe | feature/socketio |
| Register page | ⏳ In Progress | M2 — Dhanushi | feature/register-page |
| Login page | ⏳ In Progress | M2 — Dhanushi | feature/login-page |
| Booking page | ⏳ In Progress | M2 — Dhanushi | feature/booking-page |
| Staff Panel page | ⏳ In Progress | M3 — Premarathna | feature/staff-panel |
| TV Display page | ⏳ In Progress | M3 — Premarathna | feature/tv-display |
| Manager Dashboard | ⏳ In Progress | M3 — Premarathna | feature/manager-dashboard |
| Admin Panel page | ⏳ In Progress | M4 — Ilangasinghe | feature/admin-panel |
| AWS Deployment | 🔲 Pending | M1 — Wickramaratne | — |

## Team

| Member | Role | Student ID |
|--------|------|------------|
| WDD Wickramaratne | Technical Lead — Backend + AI |
| IMT Ilangasinghe | Technical Member — API + Database | 
| TG Dhanushi Uttara | Frontend Developer |
| RVS Premarathna | Frontend Developer | 


## Project Structure

iqueue-app/
├── backend/
│   ├── config/         Database connection
│   ├── middleware/     JWT auth and role guards
│   ├── models/         Mongoose schemas
│   ├── routes/         API route handlers
│   └── services/       Email, cron, Socket.io, Claude AI
├── frontend/
│   ├── app/            Next.js App Router pages
│   ├── components/     Reusable React components
│   └── lib/            Axios instance and utilities
├── .github/
│   └── pull_request_template.md
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── README.md

## Getting Started

1. Clone the repo
   git clone https://github.com/Dulana/iqueue-app.git

2. Copy environment variables
   cp .env.example .env

3. Fill in your .env values — ask M1 for the shared MongoDB URI

4. Install backend dependencies
   cd backend && npm install

5. Install frontend dependencies
   cd frontend && npm install

6. Start backend
   cd backend && npm run dev

7. Start frontend
   cd frontend && npm run dev

8. Open in browser at http://localhost:3000

## Branch Strategy

All work happens on feature branches. Nothing goes directly to main.
See CONTRIBUTING.md for the full workflow.

## Data Privacy

The Claude AI module never receives customer names, email addresses, or phone numbers. Only anonymised token IDs, aggregate counts, and statistical averages are sent to the Anthropic API.

## License

Academic project — SLTC Research University 2026