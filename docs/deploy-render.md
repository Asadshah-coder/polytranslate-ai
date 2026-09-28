# Deploying PolyTranslate AI to Render (Free)

The repo ships a **Blueprint** (`render.yaml`), so deployment is a few
clicks in the Render dashboard — no card required.

## Prerequisites

- A Render account — sign up at https://render.com with **GitHub**
  (fastest; it auto-links your repositories).
- The repo `Asadshah-coder/polytranslate-ai` is public, so Render can read it.

## Steps (your clicks)

1. **New Blueprint**
   - Render dashboard → **New +** → **Blueprint**.
   - If asked, connect your GitHub account, then pick the repository
     `Asadshah-coder/polytranslate-ai`.
   - Render reads `render.yaml` and shows three things it will create:
     `polytranslate-db` (PostgreSQL), `polytranslate-api` (FastAPI),
     `polytranslate-frontend` (Next.js).

2. **API keys (optional)**
   - Render will prompt for `GEMINI_API_KEY` and `OPENAI_API_KEY`.
     You can **skip both** — the app runs without keys and translation
     endpoints return an honest "service unavailable" message instead of
     fake output.
   - To make translation actually work, paste your **Gemini API key**
     (free from Google AI Studio) into `GEMINI_API_KEY`.
   - `JWT_SECRET` is auto-generated — don't touch it.

3. **Apply**
   - Click **Apply**. First build takes ~5–10 minutes (Docker image for
     the backend, `npm install` + `next build` for the frontend).
   - Watch the deploy logs; all three should end **"Live"**.

4. **Open the app**
   - Frontend: `https://polytranslate-frontend.onrender.com`
     (exact name is on your Render dashboard).
   - API health: `https://polytranslate-api.onrender.com/api/v1/health`
   - API docs: `https://polytranslate-api.onrender.com/api/docs`

5. **Try it**
   - Open the site → type text → **Translate** (works once
     `GEMINI_API_KEY` is set; without it you'll see the honest 503 notice).
   - Sign up for an account, check the dashboard and history.

## After deployment

- **Add the Gemini key later:** dashboard → `polytranslate-api` →
  **Environment** → add `GEMINI_API_KEY` → **Manual Deploy → Deploy
  latest commit**. (No redeploy of the frontend needed — the API URL is
  already wired.)
- **Free-tier sleep:** services spin down after ~15 min idle; first visit
  wakes them in ~60 s. Normal, not an error.
- **Database:** Render runs `alembic upgrade head` on every backend start,
  so the schema is always current. The free Postgres tier holds 1 GB.
- **Custom domain:** service → **Settings** → **Custom Domains**
  (free TLS included). If you point a domain at the frontend, update
  `NEXT_PUBLIC_SITE_URL` on `polytranslate-frontend` to the domain and
  redeploy so canonicals/sitemap use it.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Backend build fails | Re-run deploy; transient network blips are common on free builds. |
| Frontend shows API errors | Backend is still waking up — wait ~60 s and refresh. |
| `healthCheckPath` failing on API | Check deploy logs; `/api/v1/health` must return 200. |
| CORS errors in browser console | `CORS_ORIGINS` is auto-wired from the frontend hostname; if you renamed services, check it in the API service's Environment tab. |
| Translate returns 503 | No AI key configured — add `GEMINI_API_KEY` (step 2) and redeploy the API. |
