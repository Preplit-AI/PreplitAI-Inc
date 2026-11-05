# Junbee

**준비됐어? Ready when it matters.**

Junbee (준비, *JOON-bee*) turns a recorded lecture into notes a student can trust, and the notes into five minutes of review a day. Built by PreplitAI, Inc.

This repository is the **pilot**: two of the four movements in the brand book.

| Movement | In the pilot | What it does |
| --- | --- | --- |
| **배움 Learn** | Yes | Upload a lecture recording (or paste a transcript). It is transcribed, inaudible stretches are marked `[불명확]` instead of guessed, and notes are written with what the lecturer flagged for the exam. |
| **기억 Remember** | Yes | Each lecture yields 5–10 cards, scheduled with FSRS. Today's queue is one short session; progress is drawn as the comb. |
| 정리 Organize | No | Not built and not in the navigation. |
| 쌓기 Build | No | Not built and not in the navigation. |

## Run it locally

Needs Node 22 or newer. Windows: double-click `start-dev.bat`. Otherwise:

```bash
npm install
```

```bash
npm --prefix server install
```

```bash
npm --prefix server run dev
```

```bash
npm run dev
```

Web: http://localhost:8080 · API: http://localhost:5000 (the web dev server proxies `/api`).

Copy `server/.env.example` to `server/.env` and set `GROQ_API_KEY` (transcription and notes) and `JWT_SECRET`. Without a reachable `DATABASE_URL`, development uses a local PGlite database in `server/.data/pglite`; production requires PostgreSQL and refuses to start without it.

## Tests

```bash
npm test
```

```bash
npm run test:api
```

`npm test` checks the brand's rules against the source (no invented numbers, no days-in-a-row counter, navigation is Learn and Remember only, Junbee's three messages, no token in browser storage). `npm run test:api` runs the API end to end against a throwaway Postgres (PGlite) with the AI calls stubbed: sessions and token theft detection, ownership isolation, the lecture pipeline, failure saving nothing, review scheduling, and account deletion.

## How it is put together

```
src/
  pages/        public site: landing, privacy, login, sign-up (Korean, with English)
  site/         site copy (Korean first) and site components
  app/          the pilot app, Korean only: 배움, 강의 노트, 기억, 계정
  brand/        Bee (from the brand book's vectors), Comb, JunbeeMessage
  lib/          API client, auth, formatting
server/
  app.js        Express app: CORS, headers, routes, error handling
  routes/       auth, courses, lectures, review, junbee
  services/     transcription (ffmpeg + Whisper), notes and cards, FSRS, background jobs
  db/           schema and migrations
api/index.js    Vercel function wrapper (no lecture processing there; see below)
```

Brand tokens live in `tailwind.config.ts`: Ink `#15181E`, Bone `#EDEDE7`, Maroon `#8A1328` (one thing per screen), Honey `#A8690F` (marks only), Slate `#626A76`; Bricolage Grotesque for display and UI, Newsreader for reading, IBM Plex Sans KR for all Korean.

### Junbee, the bot

Junbee speaks only when a lecture finishes, one dismissible message at a time, and says exactly one of three things (`src/brand/JunbeeMessage.tsx`):

1. `9주차 노트 정리했어요. 카드 8장.`
2. … `12~14분은 잘 안 들려서 [불명확]으로 두었어요 — 추측해서 채우지 않았습니다.`
3. `‘9주차’ 녹음은 노트로 만들지 못했어요. 저장된 건 없습니다.`

## Security

- Access tokens live in memory only (15 minutes). Sessions are an httpOnly, `SameSite=Strict` refresh cookie scoped to `/api/auth`, rotated on every use; a replayed old cookie ends every session for that account.
- Passwords: bcrypt, 8–72 bytes; sign-in timing does not reveal which e-mails exist; sign-in and sign-up are rate limited per IP.
- Optional `PILOT_INVITE_CODE` restricts sign-up to the pilot cohort.
- Every course, lecture and card query is scoped to the signed-in student; ids are validated before reaching SQL.
- Uploads: audio types only, random file names in the OS temp directory, deleted right after transcription. 30-day lecture limit and per-account upload limits protect the transcription budget.
- Strict CORS allowlist (no wildcards), restrictive API headers, and a production CSP and security headers in `vercel.json`. Errors never return internal details.
- Account deletion removes everything the student owns.

## Deploying the pilot

Lecture processing runs in the background after the upload returns and handles uploads up to 200 MB, so the API must run as a long-lived Node process (a VM or container), not as a Vercel function. On Vercel, `/api/lectures` uploads answer 501. Set `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, and `TRUST_PROXY` if it sits behind a proxy.

## What was removed on 2026-11-03

The pre-Junbee product: video lecture generation (Remotion, D-ID, ElevenLabs), podcasts, GKS scholarship tools, Stripe credits and subscriptions, grounded chat, document upload and RAG, the analytics dashboard, the old marketing site and its assets, and the generated `docs/` tree. Old database tables are not dropped automatically; see `server/db/migrations/2026-11-03-drop-legacy.sql`.

Everything as it was before the removal is kept in the git ref `refs/backup/pre-junbee-2026-11-03`. To restore a file:

```bash
git checkout refs/backup/pre-junbee-2026-11-03 -- path/to/file
```

## Contact

info@preplitai.com · © 2026 PreplitAI, Inc.
