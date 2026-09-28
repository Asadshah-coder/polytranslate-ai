# PolyTranslate AI — Backend

FastAPI backend for **PolyTranslate AI** — *Translate Anything. Understand Everyone.*

Implements the frozen contract in `../docs/api.md` exactly. No fake translations,
no hard-coded AI responses, no fabricated statistics: every number comes from
the database, and without AI provider keys the AI endpoints return 503/501
with clear messages instead of fake output.

## Stack

- Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2
- JWT auth (python-jose, HS256), bcrypt password hashing (passlib)
- Rate limiting: slowapi — Redis when `REDIS_URL` is set, in-memory otherwise
- AI providers: plain `httpx` (no heavy SDKs) — Gemini (with model fallback
  chain, since Google retires model names) and OpenAI
- SQLite by default; PostgreSQL via `DATABASE_URL`

## Quickstart

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then set GEMINI_API_KEY and/or OPENAI_API_KEY + JWT_SECRET

# Database: tables auto-create on startup; or run migrations explicitly:
alembic upgrade head

# Create the first user:
python scripts/create_admin.py you@example.com 'your-password' --name "Your Name" --plan pro

# Run the API:
uvicorn app.main:app --reload
# -> http://localhost:8000/api/docs
```

## Tests

```bash
python -m pytest          # all mocked, no network, no API keys needed
```

## Environment

See `.env.example` for the full list. Key ones:

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./polytranslate.db` | Postgres URL in production |
| `REDIS_URL` | _(empty)_ | Rate-limit storage; in-memory fallback |
| `AI_PROVIDER` | `auto` | `auto` \| `gemini` \| `openai` |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` | _(empty)_ | At least one required for AI features |
| `JWT_SECRET` | `change-me-in-production` | **Must** be changed in production |
| `RATE_LIMIT_ANON` / `RATE_LIMIT_AUTH` | `30/minute` / `120/minute` | slowapi syntax |
| `FREE_MONTHLY_CHARACTERS` | `50000` | Monthly cap for the free plan |

## API

Full contract: `../docs/api.md`. Base path `/api/v1`:

- `POST /translate`, `/detect-language`, `/improve`, `/paraphrase`, `/summarize`, `/back-translate`
- `POST /documents/translate` (multipart txt/docx/pdf), `GET /documents/supported`
- `POST /speech/transcribe`, `POST /speech/synthesize` (501 unless an STT/TTS-capable provider is configured)
- `GET /languages`, `GET /languages/{code}` (109 real languages)
- `POST /auth/signup`, `/auth/login`, `GET /auth/me`, `/auth/password-reset/request|confirm`
- `GET /history`, `DELETE /history/{id}`, `DELETE /history` (auth)
- `GET /dashboard/stats` (auth, real aggregates), `GET /billing/plans`, `GET /seo/pairs`, `GET /health`

## Notes & honest limitations

- **No provider keys?** Translation/writing endpoints return `503`; speech
  endpoints return `501`. Nothing is faked.
- **Speech:** transcription and synthesis are implemented for OpenAI
  (Whisper + TTS). The Gemini path has no equivalent plain-REST speech
  endpoint wired, so with `AI_PROVIDER=gemini` speech returns `501`.
- **PDF output** is generated from extracted text (best-effort layout; complex
  scripts render without shaping — the response carries an `X-PDF-Note` header).
- **Password reset:** the request endpoint never reveals whether an email
  exists. Without SMTP configured, the token is logged server-side in
  development only — never in production.
- **Anonymous usage:** anonymous callers are governed by rate limits; monthly
  character caps apply to authenticated accounts.
- **Detection confidence** is returned only when the provider genuinely
  supplies a coarse label; otherwise it is `null` — never invented.
