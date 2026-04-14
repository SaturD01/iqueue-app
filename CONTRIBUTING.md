# Contributing to iQueue

## Team

| Member | GitHub | Branch Prefix | Role |
|--------|--------|---------------|------|
| WDD Wickramaratne | Dulana | feature/backend-* | M1 - Architecture and Backend |
| TG Dhanushi Uttara | TBD | feature/frontend-customer-* | M2 - Solution and UX |
| RVS Premarathna | TBD | feature/frontend-staff-* | M3 - Features and Planning |
| IMT Ilangasinghe | TBD | feature/ai-* | M4 - AI and Integration |

## Golden Rules

1. Never push directly to main - ever.
2. Every change goes through a Pull Request.
3. Every PR must be reviewed and approved by M1 before merging.
4. Never commit your .env file - use .env.example as reference.
5. Always pull the latest main before starting new work.

## Workflow for Every Feature

Step 1 - Sync with main before starting
git checkout main
git pull origin main

Step 2 - Create your feature branch
git checkout -b feature/your-feature-name

Step 3 - Write your code

Step 4 - Commit your changes
git add .
git commit -m "type(scope): description"

Step 5 - Push your branch
git push origin feature/your-feature-name

Step 6 - Raise a Pull Request on GitHub
- Go to github.com/Dulana/iqueue-app
- Click Compare and pull request
- Fill in the PR template completely
- Request review from M1 (Dulana)
- Link the related Issue: Closes #issue-number

Step 7 - Wait for review and approval from M1

## Commit Message Format

type(scope): short description

Types allowed:
- feat      new feature
- fix       bug fix
- docs      documentation only
- style     formatting, no logic change
- refactor  code restructure, no feature change
- test      adding tests
- chore     maintenance tasks

Examples:
feat(auth): add JWT role-based middleware for all 5 roles
fix(cron): correct no-show query to filter by calledAt not createdAt
feat(booking): add arrival-hold logic to POST /api/tokens
docs(readme): add setup instructions and team table
test(tokens): add Postman tests for call-next endpoint

## Branch Names

feature/backend-auth
feature/backend-email-service
feature/backend-token-api
feature/backend-socketio
feature/backend-claude-ai
feature/frontend-customer-register
feature/frontend-customer-login
feature/frontend-customer-booking
feature/frontend-customer-tracker
feature/frontend-staff-panel
feature/frontend-tv-display
feature/frontend-manager-dashboard
feature/frontend-admin-panel

## Environment Setup

1. Clone the repo
   git clone https://github.com/Dulana/iqueue-app.git

2. Copy env example to env
   cp .env.example .env

3. Fill in your .env values - ask M1 for the shared MongoDB URI

4. Install backend dependencies
   cd backend
   npm install

5. Install frontend dependencies
   cd frontend
   npm install

6. Start backend
   cd backend
   npm run dev

7. Start frontend
   cd frontend
   npm run dev

## Pull Request Checklist

Before raising a PR confirm all of these:
- Code runs without errors locally
- No console.log statements left in code
- No .env file committed
- Commit messages follow the convention above
- Branch is up to date with main
- PR description is filled in completely