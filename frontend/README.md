# PolyTranslate AI — Frontend

Next.js 14 (App Router) + TypeScript + Tailwind CSS frontend for **PolyTranslate AI** —
*Translate Anything. Understand Everyone.*

Consumes the FastAPI backend exactly per [`docs/api.md`](../docs/api.md). No endpoint,
field name, or shape drifts from that contract.

## Quick start

```bash
npm install
cp .env.example .env.local   # then set NEXT_PUBLIC_API_URL if needed
npm run dev                  # http://localhost:3000
```

Backend must be running (default `http://localhost:8000`).

## Scripts

| Script        | What it does                              |
|---------------|-------------------------------------------|
| `npm run dev`   | Start dev server                        |
| `npm run build` | Production build (must pass cleanly)    |
| `npm run start` | Serve the production build              |
| `npm run lint`  | ESLint                                  |
| `npm test`      | Vitest: API client + content integrity   |

Type-check: `npx tsc --noEmit`.

## Environment

| Variable               | Default                 | Purpose                          |
|------------------------|-------------------------|----------------------------------|
| `NEXT_PUBLIC_API_URL`  | `http://localhost:8000` | FastAPI backend base URL         |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical site URL (SEO, sitemap)|

## Routes

| Route | Description |
|---|---|
| `/` | Landing page with the working translator embedded |
| `/[pair]` | 16 SEO language-pair pages (e.g. `/english-to-urdu`), static-generated |
| `/blog`, `/blog/[slug]` | 5 long-form articles |
| `/languages` | Browsable registry grid, live from `GET /languages` |
| `/tools/grammar` | AI grammar corrector |
| `/tools/paraphrase` | Paraphraser (4 styles + alternatives) |
| `/tools/summarize` | Summarizer (short / bullets / detailed) |
| `/tools/back-translate` | Round-trip consistency check |
| `/tools/documents` | Document upload → translated file download |
| `/tools/speech` | Record/upload → transcribe → translate → listen |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | JWT auth |
| `/dashboard`, `/history` | Protected: real usage stats, searchable history |
| `/privacy`, `/terms` | Honest policy pages |
| `/sitemap.xml`, `/robots.txt` | Generated (public pages only) |

## Key implementation notes

- **API client** (`lib/api.ts`): typed wrapper for every contract endpoint. All failures
  surface as `ApiError` with a friendly `detail`; stack traces are never shown.
- **Auth** (`lib/auth.tsx`): JWT stored in `localStorage` (`polytranslate_token`) and sent
  as `Authorization: Bearer`. This is documented and disclosed on the privacy page; for a
  high-security deployment, move the token to an httpOnly cookie set by the backend.
- **Anonymous history**: translations made while signed out are kept in the browser's
  localStorage only (last 20), with a visible note. Signed-in users get server history.
- **Text-to-speech** (`components/VoicePlayer.tsx`): uses the browser's *real*
  `speechSynthesis` voice list — the dropdown shows exactly what the device provides, and
  warns when no voice matches the target language. Server TTS (`/speech/synthesize`) is
  offered as a separate, honestly-labeled option that degrades gracefully on 501.
- **Speech recognition**: microphone recording uploads real audio to
  `POST /speech/transcribe`; optional in-browser dictation is offered only where
  `SpeechRecognition` exists, and labeled as such.
- **RTL**: result panels set `dir="rtl"` from the language registry's `direction` field.
- **SEO**: unique title/meta/canonical/OG/Twitter per page; JSON-LD `WebSite`,
  `WebApplication`, `FAQPage` (only where real FAQs exist), `BreadcrumbList`, `BlogPosting`.
  No fake testimonials, no fabricated stats, no doorway pages.
- **Accessibility**: skip link, labels, `aria-*` states, focus-visible rings, keyboard-operable
  controls, `prefers-reduced-motion` support.

## Testing

```bash
npm test
```

Covers: API URL building, auth header behavior, error mapping (503/429/501/402/network),
login form encoding, history query params, the 16 pair slugs + content integrity
(FAQs ≥ 5, unique intros), and phrase-table correctness.
