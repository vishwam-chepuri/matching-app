# 💍 Shaadi Manager

A personal arranged marriage profile tracker — a full-stack web app for managing and comparing matrimonial profiles.

**Tech Stack**: React (Vite) frontend + Ruby on Rails API backend + PostgreSQL

## Architecture

```
Browser → React (Vercel) → Rails API (Render) → PostgreSQL (Neon)
```

```
repo-root/
  backend/    → Ruby on Rails (API mode)
  frontend/   → React + Vite
```

## Local Development Setup

### Prerequisites

- Ruby 3.2+ (via rbenv)
- Node.js 18+
- PostgreSQL 16+
- Rails 7.1+

### Backend (localhost:3001)

```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server
```

### Frontend (localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

CORS is pre-configured to allow `localhost:5173`, so both work together locally.

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Backend (Render) | PostgreSQL connection string (from Neon) |
| `RAILS_MASTER_KEY` | Backend (Render) | From `config/master.key` |
| `RAILS_ENV` | Backend (Render) | Set to `production` |
| `FRONTEND_URL` | Backend (Render) | Vercel frontend domain (e.g. `https://shaadi-manager.vercel.app`) |
| `VITE_API_BASE_URL` | Frontend (Vercel) | Rails API URL (e.g. `https://shaadi-manager-api.onrender.com/api/v1`) |

## Database (Neon PostgreSQL)

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the connection string (`postgresql://user:pass@host/db?sslmode=require`)
3. Set it as `DATABASE_URL` in your Render web service environment

Neon's free tier: 0.5 GB storage, no expiry, serverless (scales to zero, ~500ms wake).

## Render Deployment (Backend)

1. Create a **Web Service** on Render
2. Set root directory to `backend`
3. Build command: `bundle install && bundle exec rails db:migrate`
4. Start command: `bundle exec rails server -p $PORT -e production`
5. Set environment variables: `DATABASE_URL` (from Neon), `RAILS_MASTER_KEY`, `FRONTEND_URL`, `RAILS_ENV=production`

## Vercel Deployment (Frontend)

1. Import the repo to Vercel
2. Set root directory to `frontend`
3. Framework preset: Vite
4. Set environment variable: `VITE_API_BASE_URL=https://<your-render-domain>/api/v1`

## Notes

### Render Free Tier Cold Starts

Render's free tier spins down after 15 minutes of inactivity. The first request after a cold start may take 30–60 seconds. Consider upgrading to a paid plan for always-on performance.

### Photo Storage

Photos are stored via **Cloudinary** in production (local filesystem in development). The database only stores Cloudinary URLs, keeping the DB footprint minimal. Constraints:

- Max **6MB** per photo (enforced server-side)
- Max **10 photos** per profile
- Accepted formats: JPEG, PNG, WEBP
