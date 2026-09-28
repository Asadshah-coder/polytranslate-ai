# PolyTranslate AI — API Contract v1

Base path: `/api/v1`. All requests/responses JSON unless noted.
Auth (where required): `Authorization: Bearer <JWT>`.
Timestamps: ISO 8601 UTC. Language codes: ISO 639-1 (e.g. `en`, `ur`, `ar`).

> This document is the contract. The backend implements it exactly;
> the frontend consumes it exactly. Do not drift from it.

## Conventions

- `400` validation error → `{ "detail": "..." }` (or Pydantic 422 shape)
- `401` missing/invalid token → `{ "detail": "Authentication required." }`
- `404` unknown resource → `{ "detail": "..." }`
- `429` rate limited → `{ "detail": "Rate limit exceeded. Try again shortly." }`
- `501` feature needs an unconfigured provider → `{ "detail": "Speech transcription is not configured on this server." }`
- `503` AI provider unavailable/misconfigured → `{ "detail": "Translation service is temporarily unavailable." }`
- Never leak stack traces, API keys, or internal config in responses.

## POST /api/v1/translate

```json
// request
{
  "text": "Hello, how are you?",
  "source_lang": "auto",
  "target_lang": "ur",
  "tone": "general",
  "style": "natural"
}
// tone: general|formal|casual|professional|academic|marketing|technical (default "general")
// style: natural|literal|professional|concise (default "natural")
// text: 1..10000 chars; source_lang: "auto" or valid code; target_lang: valid code
```

```json
// 200 response
{
  "translated_text": "ہیلو، آپ کیسے ہیں؟",
  "source_lang": "en",
  "source_lang_name": "English",
  "target_lang": "ur",
  "target_lang_name": "Urdu",
  "was_auto_detected": true,
  "source_char_count": 19,
  "translated_char_count": 20,
  "duration_ms": 842,
  "provider": "gemini",
  "model": "gemini-3.8-flash"
}
```

Notes:
- `source_lang` in the response is the resolved code (after auto-detection).
- No fake `confidence` numbers. If the provider supplies a coarse confidence
  label it may be returned as `"detection_confidence": "high"|"medium"|"low"|null`;
  otherwise the field is `null`.
- Every successful call is recorded in history (authenticated users) and counts
  against usage limits.

## POST /api/v1/detect-language

```json
// request: { "text": "مجھے آج کام پر جانا ہے" }
// 200 response:
{
  "language_code": "ur",
  "language_name": "Urdu",
  "native_name": "اردو",
  "confidence": null
}
```

`confidence` is a coarse label (`high`/`medium`/`low`) only when the provider
genuinely supplies one; otherwise `null`. Never invent numeric scores.

## POST /api/v1/improve

```json
// request: { "text": "He go to market yesterday.", "language": "en" }
// 200: { "improved_text": "He went to the market yesterday." }
```

## POST /api/v1/paraphrase

```json
// request: { "text": "...", "style": "professional" }
// style: simple|professional|academic|creative (default "professional")
// 200: { "paraphrased_text": "...", "alternatives": ["...", "..."] }
```

## POST /api/v1/summarize

```json
// request: { "text": "...", "format": "bullets" }
// format: short|bullets|detailed (default "short")
// 200: { "summary": "..." }   // string; bullets separated by newlines
```

## POST /api/v1/back-translate

```json
// request: { "text": "I have to go to work today.", "source_lang": "en", "target_lang": "ur" }
// 200:
{
  "original_text": "I have to go to work today.",
  "translated_text": "مجھے آج کام پر جانا ہے۔",
  "back_translated_text": "I need to go to work today.",
  "source_lang": "en",
  "target_lang": "ur"
}
```

The UI must not claim back-translation proves accuracy.

## POST /api/v1/documents/translate

Multipart form: `file` (txt|docx|pdf), `source_lang`, `target_lang`
(`auto` allowed), `output_format` = `txt|docx|pdf` (default same as input
where supported).

- 200: file download with `Content-Disposition: attachment`.
- Limits: `MAX_FILE_SIZE_MB` (default 10); extracted text capped at
  `MAX_DOCUMENT_CHARS` (default 50000) with a clear 400 error above it.
- PDF output is generated from extracted text (layout is best-effort and the
  response notes this); TXT/DOCX preserve structure more faithfully.

## GET /api/v1/documents/supported

```json
{ "input": ["txt", "docx", "pdf"], "output": ["txt", "docx", "pdf"] }
```

## POST /api/v1/speech/transcribe

Multipart form: `audio` (mp3|wav|m4a|ogg|webm, ≤ `MAX_AUDIO_MB`, default 25).

```json
// 200: { "transcript": "...", "language_code": "ur" }  // language_code may be null
// 501 when no STT provider is configured.
```

## POST /api/v1/speech/synthesize

```json
// request: { "text": "...", "language": "ur", "voice": null, "speed": 1.0 }
// 200: audio file download (format depends on provider)
// 501 when no TTS provider is configured.
```

## GET /api/v1/languages

```json
{
  "languages": [
    { "code": "ur", "name": "Urdu", "native_name": "اردو",
      "direction": "rtl", "locale": "ur-PK" }
  ],
  "count": 100
}
```

## GET /api/v1/languages/{code}

Single language object or 404.

## POST /api/v1/auth/signup

```json
// request: { "name": "Asad Bukhari", "email": "a@b.com", "password": "..." }
// 201: { "access_token": "…", "token_type": "bearer",
//        "user": { "id": 1, "name": "…", "email": "…", "plan": "free" } }
```

Password: min 8 chars. Email unique. Passwords hashed with bcrypt, never stored plain.

## POST /api/v1/auth/login

OAuth2 password form (`username` = email, `password`).
200: `{ "access_token": "…", "token_type": "bearer" }`. 401 on bad credentials.

## GET /api/v1/auth/me 🔒

200: `{ "id": 1, "name": "…", "email": "…", "plan": "free", "created_at": "…" }`

## POST /api/v1/auth/password-reset/request

Request: `{ "email": "…" }`. 200 always: `{ "message": "If an account exists, a reset link has been sent." }`
(No account enumeration. In development the token is logged server-side only.)

## POST /api/v1/auth/password-reset/confirm

Request: `{ "token": "…", "new_password": "…" }`.
200: `{ "message": "Password has been reset." }`. 400 on invalid/expired token.

## GET /api/v1/history 🔒

Query: `search` (optional), `limit` (default 20, max 100), `offset` (default 0).

```json
{ "items": [
    { "id": 7, "source_lang": "en", "target_lang": "ur",
      "source_text": "…", "translated_text": "…",
      "tone": "general", "style": "natural",
      "created_at": "2026-09-28T12:00:00Z" }
  ], "total": 42 }
```

## DELETE /api/v1/history/{id} 🔒 → 204
## DELETE /api/v1/history 🔒 → 204 (clears all)

## GET /api/v1/dashboard/stats 🔒

```json
{ "plan": "free",
  "chars_used_this_month": 1234,
  "chars_limit": 50000,
  "translations_count": 56,
  "documents_count": 3,
  "speech_requests": 2 }
```

All numbers are real aggregates from the database — never fabricated.

## GET /api/v1/billing/plans

```json
{ "plans": [
    { "id": "free", "name": "Free", "price_usd": 0,
      "monthly_characters": 50000,
      "features": ["100+ languages", "AI writing tools", "Translation history"] },
    { "id": "pro", "name": "Pro", "price_usd": 12,
      "monthly_characters": 2000000, "features": ["Everything in Free", "Document translation", "Priority speed"] },
    { "id": "business", "name": "Business", "price_usd": 49,
      "monthly_characters": 10000000, "features": ["Everything in Pro", "Team seats", "API access"] }
  ] }
```

Static config (billing abstraction; Stripe to be plugged in later — no fake checkout).

## GET /api/v1/seo/pairs

```json
{ "pairs": [ { "slug": "english-to-urdu", "source_lang": "en",
               "target_lang": "ur", "title": "English to Urdu Translator" } ] }
```

## GET /api/v1/health

```json
{ "status": "ok", "version": "1.0.0",
  "provider_configured": true, "provider": "gemini",
  "database": "ok" }
```

## Rate limits (defaults, env-overridable)

- Anonymous: `RATE_LIMIT_ANON` (default `30/minute`) on translate/detect/improve/paraphrase/summarize/back-translate.
- Authenticated: `RATE_LIMIT_AUTH` (default `120/minute`).
- Exceeding → 429 with `Retry-After` header.
- Usage caps: `FREE_MONTHLY_CHARACTERS` (default 50000), `PRO_MONTHLY_CHARACTERS`
  (default 2000000). Exceeding → 402 `{ "detail": "Monthly character limit reached." }`.

## Environment variables (backend)

```
APP_ENV=development|production
APP_NAME=PolyTranslate AI
APP_VERSION=1.0.0
DATABASE_URL=sqlite:///./polytranslate.db   # postgres://user:pass@db:5432/polytranslate in compose
REDIS_URL=                                  # optional; in-memory fallback when empty
AI_PROVIDER=auto                            # auto|gemini|openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash
JWT_SECRET=change-me
JWT_EXPIRE_MINUTES=10080
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE_MB=10
MAX_DOCUMENT_CHARS=50000
MAX_AUDIO_MB=25
RATE_LIMIT_ANON=30/minute
RATE_LIMIT_AUTH=120/minute
FREE_MONTHLY_CHARACTERS=50000
PRO_MONTHLY_CHARACTERS=2000000
BUSINESS_MONTHLY_CHARACTERS=10000000
```

No real secrets in the repo. Ever.
