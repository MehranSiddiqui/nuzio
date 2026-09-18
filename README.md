# Nuzio — Personalized Audio News (desktop web)

Desktop web build of the Nuzio mobile app's two core flows: **Login** and **personalized news playback (Brief)**. Frontend is Next.js + TypeScript, backend is Express + TypeScript.

## Structure

```
frontend/   Next.js (App Router, TypeScript, Tailwind)
backend/    Express API (TypeScript, JWT auth, in-memory data)
```

## Features

- **Login** — "Continue with Google" (mocked OAuth so the flow works without real Google
  credentials — swap in a verified Google ID token exchange later) plus a real
  email/password sign up & sign in, matching the dark violet Nuzio design.
- **Brief** — personalized morning news feed ranked by the signed-in user's niches,
  played aloud with the browser's built-in speech synthesis (an actual "now playing"
  audio experience, not a fake progress bar), with per-article play/pause, category
  filters and search.

## Local development

**Backend**

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

**Frontend** (new terminal)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev         # http://localhost:3000
```

Open the printed frontend URL — it redirects to `/login`.

## Deployment (Vercel + Render)

**Backend → Render**

1. Push this repo to GitHub.
2. In Render: New → Blueprint → pick the repo (uses `backend/render.yaml`).
3. Set the `CLIENT_ORIGIN` env var to your Vercel URL once you have it (step below).
4. Render gives you a URL like `https://nuzio-backend.onrender.com`.

**Frontend → Vercel**

1. In Vercel: New Project → import the same repo → set **Root Directory** to `frontend`.
2. Add env var `NEXT_PUBLIC_API_URL` = your Render backend URL.
3. Deploy. Vercel gives you a URL like `https://nuzio.vercel.app`.
4. Go back to Render and set `CLIENT_ORIGIN` to that Vercel URL, then redeploy the backend.

Both cookies and CORS are already wired for cross-domain (`SameSite=None; Secure` in
production), so login persists correctly across the two domains.

## Notes / what's mocked

- "Continue with Google" is a demo provider (no real Google OAuth app was configured) —
  it creates/loads a demo user server-side. Swap `backend/src/routes/auth.ts`'s `/google`
  handler for a real Google ID token verification when you have OAuth credentials.
- News articles are a small curated seed set in `backend/src/data/articles.ts`, not a
  live feed — enough to demonstrate personalization and ranking by niche.
