# Preplit AI

**A companion for international students in Korea.**

Preplit AI holds a student's context (university, year, major, courses, deadlines, what was said in class) so they don't have to. Inside it is **Juno**, a magpie in a graduation cap: the student talks to Juno, and Juno remembers, reminds, explains and points to what matters on campus.

Built by Preplit AI, Inc. · info@preplitai.com

## What's in this repository

| Part | Where | What it is |
| --- | --- | --- |
| Mobile app | `mobile/` | The product. One Expo (React Native) project for Android, iOS and the web. Its own [README](mobile/README.md) has the full status of every feature |
| API | `server/` | Express and PostgreSQL. Shared by the app and the website. Routes are listed in [server/README.md](server/README.md) |
| Website | `src/`, `site/`, `public/` | The public site (landing, pricing, privacy), sign-up and log-in, and the earlier web workspace, which is behind a developer-only wall |
| Web build of the app | `public/m/` | The app built for the browser, served at `/m`. Generated: rebuild it, don't edit it |
| Vercel function | `api/` | `index.js` runs the API |
| Campus reader | `campus-reader/` | A Cloudflare Worker that reads university notice boards every 3 hours and sends them to the API (Ajou refuses Vercel's network) |

## The app

Five places, with Juno in the middle: **Home · Campus · Juno · Buddy · Community**.

- **Onboarding.** One question a screen, answered with a tap: language, Korean level, university, program, year, major, where the student is now, a first class. Juno asks; every answer is saved as it is given.
- **Juno.** The main chat. Answers from the student's own lectures with sources. Told about a deadline ("lab report due Friday 6pm"), Juno saves it with a reminder; he can also read deadlines out of a screenshot of the student's LMS.
- **Lecture Buddy.** Pick the course, press one button, and the class is transcribed as it happens; Stop saves the notes, key terms and a short quiz to that course. No audio is stored.
- **Campus.** The university's own notices, in English, sorted into scholarships, jobs, programs, events, visa and academic notices, with links to the portal, LMS and offices. Ajou University only so far. On the live site the boards are read by a Cloudflare Worker, because Ajou's site refuses Vercel's network (see [campus-reader/](campus-reader/README.md)).
- **Community.** One room per university for its international students: photos, questions, replies.
- **Reminders.** Deadlines and short quizzes arrive as phone notifications, never in quiet hours.

Test link: https://www.preplitai.com/m/?dev=1

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

Website: http://localhost:8080 · API: http://localhost:5000 (the website's dev server forwards `/api`).

The app: see [mobile/README.md](mobile/README.md) (`cd mobile`, `npm install`, `npm start`, then Expo Go or a browser).

Copy `server/.env.example` to `server/.env` and set `JWT_SECRET` and `GROQ_API_KEY` (transcription, notes, Juno, reading screenshots). Without a reachable `DATABASE_URL`, development uses a local PGlite database in `server/.data/pglite`; production requires PostgreSQL and refuses to start without it.

## Tests

```bash
npm test
```

```bash
npm run test:api
```

```bash
cd mobile && npx tsc --noEmit
```

`npm test` checks the website and the app's logic (reminders and quiet hours, quizzes, the brand's rules). `npm run test:api` runs the API end to end against a throwaway PGlite database with the AI calls stubbed: accounts and sessions, ownership, lectures and live listening, Juno's tools and citations, deadlines from screenshots, the campus board and the community.

The tests script what the model says, so they check the server and not the model's judgment. To try real questions against the real model (needs `GROQ_API_KEY`, costs a few cents):

```bash
npm --prefix server run eval:chat
```

## Deploying

Pushing to `main` is meant to deploy www.preplitai.com through Vercel (project `preplit-ai-inc`). The repository now lives in the `Preplit-AI` GitHub organisation, and since that move pushes have not started deployments by themselves. Until Vercel's GitHub app is given access to the organisation's repository, deploy from Vercel: Deployments → ⋯ → Create Deployment → `main` → Deploy to Production.

After changing the app, rebuild its web version and commit it with the change:

```bash
npm run mobile:web
```

Vercel needs `DATABASE_URL`, `JWT_SECRET` and `GROQ_API_KEY`. Optional: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (Google sign-in), `RESEND_API_KEY` and `EMAIL_FROM` (password reset), `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` (web push), `CAMPUS_INGEST_KEY` (the campus reader's key; see [campus-reader/](campus-reader/README.md)), `TRANSCRIBE_INTERNAL_API_KEY` (Lecture Buddy's transcription service at transcribe.iw12.org; without it the AI model transcribes).

## Security

- Access tokens live in memory only (15 minutes). Sessions are an httpOnly, `SameSite=Strict` refresh cookie scoped to `/api/auth`, rotated on every use; a replayed old cookie ends every session for that account.
- Passwords: bcrypt; sign-in timing does not reveal which e-mails exist; sign-in, sign-up and uploads are rate limited.
- Every query is scoped to the signed-in student, and ids are validated before reaching SQL.
- Audio is deleted as soon as it is transcribed; Lecture Buddy keeps only the words. Screenshots are read in memory and not stored.
- Juno's tools act only for the signed-in student, and only in the app's main chat. Citations to anything the tools did not return are removed.
- The community shows first names only; three reports hide a post.
- Strict CORS, restrictive headers and a production CSP in `vercel.json`. Errors never return internal details.
- Deleting an account removes everything the student owns.

## History

The earlier product (video lectures, podcasts, scholarship tools, credits and subscriptions) was removed on 2026-11-03. Everything as it was before is kept in the local git ref `refs/backup/pre-pilot-2026-11-03`:

```bash
git checkout refs/backup/pre-pilot-2026-11-03 -- path/to/file
```

© 2026 Preplit AI, Inc.
