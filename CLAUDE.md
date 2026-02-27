# CLAUDE.md — Shaadi Manager

## Dev Commands

### Backend (Rails API) — `cd backend/`
```sh
bin/rails server -p 3001        # start dev server
bin/rails db:migrate             # run pending migrations
bin/rails db:seed                # seed database
bin/rails console                # Rails console
bundle install                   # install gems
```

### Frontend (React SPA) — `cd frontend/`
```sh
npm run dev        # Vite dev server on localhost:5173
npm run build      # production build
npm run lint       # ESLint
npm run preview    # serve production build locally
```

## Architecture

Monorepo with two independent apps:

```
matching_app/
  backend/    — Rails 7.2 API-only (Ruby 3.2.2, Puma, PostgreSQL)
  frontend/   — React 19 + Vite 7, plain JSX (no TypeScript)
```

**Stack:** React SPA (Vercel) → Rails JSON API (Render) → PostgreSQL (Neon)

- **Auth:** Stateless JWT (HS256, 30-day expiry, `bcrypt` passwords). Token in `Authorization: Bearer <token>` header; stored client-side in `localStorage` (`sm_token`).
- **Photo storage:** Local filesystem in dev (`public/uploads/photos/`), Cloudinary in prod. Abstracted via `PhotoStorage` service.
- **Styling:** Single global CSS file (`index.css`) with CSS custom properties. "Warm luxury" theme — maroon `#7B1B1B`, gold `#C9963E`, cream `#FFF8F0`. Fonts: Cormorant Garamond (headings), DM Sans (body). BEM-inspired class names.
- **Routing:** No react-router. State-based page switching in `App.jsx` (AuthPage / AdminPage / Home).
- **Admin:** `is_admin` boolean on User. Admins see all profiles cross-user; regular users are scoped to their own.

## Key Conventions

- **API namespace:** All endpoints under `/api/v1/`. Frontend `VITE_API_BASE_URL` points here.
- **User-scoped data:** `ApplicationController#profile_scope` returns `current_user.profiles` (or `Profile.all` for admins). All profile/photo reads go through this.
- **Profile params:** Must be wrapped as `{ profile: { ... } }` in request body.
- **Sorting:** Server-side via `?sort_by=age&sort_dir=asc`. Keys: `age`, `height`, `dob`, `package`, `status`, `added_date` (default).
- **Filtering:** Client-side in `Home.jsx` via `useMemo` over fetched profiles array.
- **Photo upload:** Multipart `POST /api/v1/profiles/:id/photos`. Server validates JPEG/PNG/WEBP, max 6 MB. Client caps at 10 photos per profile.
- **CORS:** Allows `FRONTEND_URL` env var + `localhost:5173`.

## Important Paths

### Backend
| Path | Purpose |
|------|---------|
| `config/routes.rb` | API route definitions |
| `app/controllers/application_controller.rb` | JWT auth, `profile_scope`, `admin_only!` |
| `app/controllers/api/v1/` | All API controllers (profiles, photos, users, sessions) |
| `app/models/` | `User`, `Profile`, `ProfilePhoto` |
| `app/services/photo_storage.rb` | Dual-mode photo I/O (local/Cloudinary) |
| `db/schema.rb` | Current DB schema |
| `config/initializers/cors.rb` | CORS configuration |

### Frontend
| Path | Purpose |
|------|---------|
| `src/App.jsx` | Root component, state-based routing |
| `src/context/AuthContext.jsx` | Auth provider (user, token, login/logout) |
| `src/api/client.js` | Fetch wrapper (base URL, auth header, FormData) |
| `src/api/` | Domain API modules (auth, profiles, photos, admin) |
| `src/pages/` | AuthPage, Home, AdminPage |
| `src/components/` | ProfileCard, ProfileModal, ProfileDetail, CompareView, FilterBar, PhotoGallery, etc. |
| `src/utils/helpers.js` | Formatting, status options/colors, rashi options |
| `src/index.css` | All styles (CSS custom properties + BEM classes) |

## Environment Variables
| Variable | Location | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Backend (prod) | PostgreSQL connection string (from Neon — serverless, 0.5 GB free) |
| `RAILS_MASTER_KEY` | Backend (prod) | Decrypt Rails credentials |
| `BACKEND_URL` | Backend | Base URL for local photo URLs (default `http://localhost:3001`) |
| `FRONTEND_URL` | Backend | CORS allowed origin |
| `CLOUDINARY_URL` | Backend (prod) | Cloudinary credentials (auto-read by gem) |
| `VITE_API_BASE_URL` | Frontend | Rails API base URL (e.g. `https://host/api/v1`) |
