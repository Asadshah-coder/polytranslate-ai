# PolyTranslate AI

**Translate Anything. Understand Everyone.**

A production-quality multilingual AI translation SaaS — FastAPI backend,
Next.js frontend, PostgreSQL, Redis, Docker. Real AI translation via a
provider abstraction (OpenAI / Gemini), 109 languages with RTL support,
AI writing tools, document translation, speech translation, user accounts,
translation history, usage limits, and a full programmatic-SEO architecture.

> Built as a serious AI Engineer portfolio project. No fake translations, no
> fake stats, no dead buttons — every feature either works for real or says
> honestly why it can't (e.g. speech endpoints return `501` when no provider
> key is configured, instead of inventing output).

---

## ✨ Features

**Translation core**
- Text translation across **109 languages** (central registry with native
  names, locales, RTL/LTR direction)
- Automatic language detection (no invented confidence scores)
- 7 tones (general, formal, casual, professional, academic, marketing,
  technical) × 4 styles (natural, literal, professional, concise)
- Domain-aware prompt engine (general / business / academic / marketing /
  technical) that preserves meaning, names, numbers, dates, URLs, formatting
- Live stats: detected language, character counts, translation time

**AI writing tools** — grammar corrector, paraphraser (4 styles),
text improver, summarizer (short / bullets / detailed), back-translation
with an honest "consistency check, not proof of accuracy" disclaimer

**Documents** — upload TXT/DOCX/PDF → chunked translation → download
TXT/DOCX/PDF (PDF layout best-effort, disclosed)

**Speech** — mic/audio → transcription → translation → playback; browser
Web Speech API + speechSynthesis work key-free, server STT/TTS via OpenAI
when configured

**Accounts** — signup/login (JWT + bcrypt), password reset, dashboard with
real usage stats, searchable/deletable translation history

**Platform** — rate limiting (anon/auth tiers, Redis or in-memory),
env-configured monthly character quotas, billing abstraction
(Free/Pro/Business, Stripe-ready), health checks

**SEO** — 16 programmatic language-pair pages (`/english-to-urdu`, …) with
unique content, 5 long-form blog articles, sitemap.xml, robots.txt,
JSON-LD (WebSite, WebApplication, FAQPage, BreadcrumbList), per-page
meta/OG/Twitter tags

---

## 🧱 Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic |
| AI | Provider abstraction — OpenAI (chat, Whisper, TTS), Gemini (generateContent REST + model fallback chain); plain `httpx`, no heavy SDKs |
| Database | PostgreSQL 16 (SQLite for local dev) |
| Cache / rate limits | Redis 7 (optional; in-memory fallback) |
| Tests | pytest (backend, mocked providers), vitest (frontend) |
| Deploy | Docker Compose (frontend + backend + postgres + redis) |

Architecture diagrams and honest limitations: [`docs/architecture.md`](docs/architecture.md).
API reference: [`docs/api.md`](docs/api.md).

---

## 🚀 Quickstart (Docker — recommended)

```bash
cp .env.example .env   # then set JWT_SECRET and GEMINI_API_KEY and/or OPENAI_API_KEY
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8000 · interactive docs: http://localhost:8000/api/docs

> Without an AI key the app still runs: translation endpoints return a clear
> `503`, speech endpoints `501`. Everything else (auth, history, SEO pages,
> UI) works fully.

## 🛠️ Local development

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env   # set GEMINI_API_KEY and/or OPENAI_API_KEY, JWT_SECRET
alembic upgrade head      # creates tables (also auto-created on startup)
uvicorn app.main:app --reload   # → http://localhost:8000
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                  # → http://localhost:3000
```

**Create the first admin/user**

```bash
cd backend && source .venv/bin/activate
python scripts/create_admin.py you@example.com 'your-password' --name "Your Name" --plan pro
```

**Run tests**

```bash
cd backend && source .venv/bin/activate && python -m pytest   # 62 tests, mocked AI, no network
cd frontend && npm test                                        # 29 tests
```

---

## 🔌 API

Full contract: [`docs/api.md`](docs/api.md). Highlights (`/api/v1`):

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/translate` | – |
| POST | `/detect-language` | – |
| POST | `/improve`, `/paraphrase`, `/summarize` | – |
| POST | `/back-translate` | – |
| POST | `/documents/translate` | – |
| POST | `/speech/transcribe`, `/speech/synthesize` | – |
| GET | `/languages`, `/languages/{code}` | – |
| POST | `/auth/signup`, `/auth/login`, `/auth/password-reset/*` | – |
| GET | `/auth/me`, `/dashboard/stats` | 🔒 |
| GET/DELETE | `/history`, `/history/{id}` | 🔒 |
| GET | `/billing/plans`, `/seo/pairs`, `/health` | – |

Interactive docs at `/api/docs` when the backend runs.

## 🔍 SEO architecture

- **Pair pages** (`/[pair]`): 16 curated pairs, statically generated, each with
  unique H1/intro, a *working* translator preset to that pair, curated phrase
  tables (only translations we're confident in), real examples, FAQs, tips,
  related pairs, and JSON-LD trio.
- **Blog** (`/blog`): 5 genuine long-form articles (~1,100+ words each).
- **Meta**: unique title/description/canonical/OG/Twitter per indexable page.
- **Structured data**: WebSite (home), WebApplication (translator),
  FAQPage (only where visible FAQs exist), BreadcrumbList, BlogPosting.
- **sitemap.xml**: 34 URLs (home, pairs, blog, tools, languages). **robots.txt**
  allows public pages, blocks `/dashboard`, `/history`, `/api`.

## 🔒 Security & privacy

- bcrypt hashing, JWT auth, signed single-use password-reset tokens (1h),
  no account enumeration, Pydantic validation everywhere, upload type/size
  caps, ORM-only DB access, CORS allowlist, no stack traces or secrets in
  responses. See the honest limitation list in `docs/architecture.md`.
- Privacy page (`/privacy`) documents exactly what is processed, stored,
  and deleted — including that authenticated history is stored server-side
  and anonymous history lives only in the browser.

## 🗺️ Roadmap

- Stripe checkout via the billing abstraction (plans/prices already defined)
- httpOnly-cookie auth hardening (currently localStorage JWT — documented)
- Traditional Chinese + Arabic-dialect SEO pages (new curated content)
- Server-side TTS voice catalog per provider
- Background document jobs (Celery/Redis) for very large files
- Admin panel, team workspaces, public API keys

## 🤝 Contributing

1. Fork, create a feature branch.
2. Backend: add tests (`python -m pytest` must stay green). Frontend:
   `npm run lint && npm test && npm run build`.
3. Never commit secrets; never invent AI output — degrade honestly (503/501).
4. Open a PR describing the change and its tests.

## 📄 License

MIT — see [LICENSE](LICENSE).

Portfolio: https://asadbukhari.site
