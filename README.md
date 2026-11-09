# Junbee

**준비됐어? Ready when it matters.**

Junbee (준비, *JOON-bee*) is a bee that goes through the semester with a student. They press record when class starts and stop when it ends. Notes they can trust file themselves under that course and week, become five minutes of review a day, and add up to being ready for the exam. Built by Preplit AI, Inc.

This repository is the **pilot**: two of the four movements in the brand book, around one screen for the semester.

| Movement | In the pilot | What it does |
| --- | --- | --- |
| **배움 Learn** | Yes | Record the class inside the app (or fill a missed week with an audio file or a transcript). It is transcribed, inaudible stretches are marked `[불명확]` instead of guessed, and detailed notes are written with what the lecturer flagged for the exam. |
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

Copy `server/.env.example` to `server/.env` and set `GROQ_API_KEY` (transcription, notes and answers) and `JWT_SECRET`. Without a reachable `DATABASE_URL`, development uses a local PGlite database in `server/.data/pglite`; production requires PostgreSQL and refuses to start without it.

## Tests

```bash
npm test
```

```bash
npm run test:api
```

`npm test` checks the brand's rules against the source (no invented numbers, no days-in-a-row counter, navigation is the semester, Learn and Remember only, what the bee may say, no token in browser storage) and the workspace's screen behaviour. `npm run test:api` runs the API end to end against a throwaway Postgres (PGlite) with the AI calls stubbed: sessions and token theft detection, ownership isolation, the lecture pipeline, failure saving nothing, review scheduling, account deletion, the semester and its reminders, and the chat's tools, citations, search and limits.

The recorder needs a real browser and a microphone, so those tests do not cover it. Try it by hand after changing `src/workspace/recorder/`: record, move between screens, refresh mid-recording and recover it, then stop.

Those tests script what the model says, so they check the server and not the model's judgment. For that, run real questions against the real model. It needs a working `GROQ_API_KEY`, uses a throwaway database, and costs a few cents of model time:

```bash
npm --prefix server run eval:chat
```

## How it is put together

```
src/
  pages/        public site: landing, privacy, login, sign-up (Korean, with English)
  site/         site copy (Korean first) and site components
  app/          the pilot app, Korean only: 배움, 강의 노트, 기억, 계정
  workspace/    Korean only: the semester home, course workspaces, the bee, and recorder/
  brand/        Bee (from the brand book's vectors), Comb, JunbeeMessage
  lib/          API client, auth, formatting, notifications
public/sw.js    shows phone notifications when the app is closed
server/
  app.js        Express app: CORS, headers, routes, error handling
  routes/       auth, courses, lectures, review, junbee, chat, semester, push
  services/     *Store: data access shared by routes and chat tools
                semesterStore: weeks, gaps, exam countdowns, what the bee says
                transcription (ffmpeg + Whisper), notes and cards, FSRS, background jobs
                chatAgent, chatTools, lectureChunks: answering, tools, search
                pushService, reminders: phone notifications
  evals/        real questions against the real model
  db/           schema and migrations
api/index.js    Vercel function wrapper (no lecture processing there; see below)
```

Brand tokens live in `tailwind.config.ts`: Ink `#15181E`, Bone `#EDEDE7`, Maroon `#8A1328` (one thing per screen), Honey `#A8690F` (marks only), Slate `#626A76`; Bricolage Grotesque for display and UI, Newsreader for reading, IBM Plex Sans KR for all Korean.

### The path a lecture takes

Record in class, then notes, then cards, then the exam. `/workspace` lays out that path and says where each step stands, so a student can see it and move along it.

- **The semester is a comb.** One cell per week, with the bee on this week (`src/workspace/SemesterComb.tsx`). A filled cell has a real recording in it. Weeks before a student's first recording are not held against them; a dashed cell is an empty week since then. An exam is marked only where the student entered its date.
- **Each course has a workspace** at `/workspace/courses/:id`: its weeks and notes, what the lecturer flagged for the exam, its cards, and its schedule.
- **Everything links to where it came from.** A recording files itself under its course and week, a card leads back to its lecture and course, and a note leads back to its course.

### Recording in class

`src/workspace/recorder/` records in the browser: press 수업 녹음 시작, pick the course, press 수업 끝. It lives above the routes, so the student can move around the app mid-lecture.

A lecture cannot be recorded twice, so nothing depends on the recording surviving in memory. Audio is written to the device's browser storage every 10 seconds and stays until the notes exist. A crash, a closed tab, a lost connection or a failed transcription leaves it there to upload again, and the semester screen says so. On the server, the audio is deleted right after transcription, as before.

The screen is kept on while recording, the bar warns if no sound is coming in, and a recording stops by itself at 4 hours. **The limit to know about:** a browser cannot record reliably on a phone with the screen locked or the app in the background, iPhones especially. A laptop is the dependable way today; true background recording needs a native app.

### What the bee says

One thing at a time, and always counted facts: no praise, no guilt, no exclamation marks, nothing about days in a row. `chooseMessage` in `server/services/semesterStore.js` picks which applies, most urgent first, and `src/workspace/beeText.ts` holds the words: a lecture that just finished (`src/brand/JunbeeMessage.tsx`), a class today with no recording, an exam within 14 days, today's cards. With no exam date there is no countdown, because dates are never guessed.

The bee sits in the corner of every screen and stays quiet until asked. Asking opens a panel that knows what is on screen: on a note it means that lecture, in a course it means that course. There is one running conversation per course, and no list of chats to manage.

### Phone notifications

With VAPID keys set, a student can turn on notifications (`public/sw.js`, `server/services/reminders.js`): class days at 8am, notes ready, exams at 14, 7, 3 and 1 days, and cards left at 8pm. Each reminder goes out once, nothing is sent between 10pm and 8am, and there is no message for not studying. iPhones only allow this once Junbee is added to the home screen.

### Asking the bee

The bee answers from the student's own lectures, in the same plain voice, and keeps the product's rule: only what was said, nothing filled in where the transcript says `[불명확]`.

- **Features connect through tools.** Each tool in `server/services/chatTools.js` is a thin wrapper over the same `*Store` service the HTTP routes use. To connect a feature to Junbee, add a tool.
- **Tools only read.** No tool takes a student id; it comes from the session. Nothing a model is told by a transcript can delete, change or rate anything. A conversation limited to one course stays limited in the tools themselves.
- **Answers are checked, not trusted.** The model cites what it uses as `[S1]`. The server removes any citation to something the tools did not return, and an answer left with none is labelled for the student as not coming from their lectures.
- **Search needs no extension.** `server/services/lectureChunks.js` compares Korean as character pairs ranked by rarity, so particles do not matter, and a chunk must cover enough of the question to count. That is what lets Junbee say a topic is not in the lectures. If evals show it missing paraphrases, embeddings are the next step.
- **A failed or cancelled answer saves nothing**, and the question returns to the box. Each student gets 600 questions per rolling 30 days (`MONTHLY_CHAT_LIMIT`) and one answer at a time.
- **Not built yet:** the older features (summaries, quizzes, predicted exams, document upload), a native app for background recording, and a tool that lets the bee act rather than only read.

### Long lectures and provider limits

A 50-minute class is about 14,000 tokens, more than a lower-tier Groq plan accepts in one request. So `server/services/lectureService.js` writes long lectures in parts of 8,000 characters (`NOTES_PART_CHARS`), in order, then joins them and writes the title and summary from the result. A part that fails fails the lecture, so no note is saved with a hole in it.

Lecture processing runs in the background, so it waits out a per-minute rate limit rather than failing: a 75-minute lecture took about two minutes on an 8,000-a-minute plan. A question in chat cannot wait, so it falls back to the second model, then says the bee is busy. Provider limits are shared by the whole organization, not per student, so a pilot's size is decided by the plan. If a daily limit runs out, a recording made in the app stays on the student's device to make notes from again.

## Security

- Access tokens live in memory only (15 minutes). Sessions are an httpOnly, `SameSite=Strict` refresh cookie scoped to `/api/auth`, rotated on every use; a replayed old cookie ends every session for that account.
- Passwords: bcrypt, 8–72 bytes; sign-in timing does not reveal which e-mails exist; sign-in and sign-up are rate limited per IP.
- Optional `PILOT_INVITE_CODE` restricts sign-up to the pilot cohort.
- Every course, lecture and card query is scoped to the signed-in student; ids are validated before reaching SQL.
- Uploads: audio types only, random file names in the OS temp directory, deleted right after transcription. 30-day lecture limit and per-account upload limits protect the transcription budget.
- Strict CORS allowlist (no wildcards), restrictive API headers, and a production CSP and security headers in `vercel.json`. Errors never return internal details.
- Account deletion removes everything the student owns, including conversations.
- Answers render as text only: no raw HTML, no images, and no links except citations, so a transcript cannot get a model to show a student a link.
- The server only sends notifications to real browser push services, so a student cannot register an internal address for it to call. Signing out turns notifications off on that device.
- Recordings waiting on a device are kept per account and removed after 14 days.

## Deploying the pilot

Lecture processing runs in the background after the upload returns and handles uploads up to 200 MB, so the API must run as a long-lived Node process (a VM or container), not as a Vercel function. On Vercel, `/api/lectures` uploads answer 501. Answers stream for as long as the model takes, and their limits assume one process, so run chat there too. Reminders run on that process too. A proxy in front must not buffer `text/event-stream`. Set `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` for notifications (generate them with `npx --prefix server web-push generate-vapid-keys`), and `TRUST_PROXY` if it sits behind a proxy. The site must be served over HTTPS, or browsers refuse both the microphone and notifications.

## What was removed on 2026-11-03

The pre-Junbee product: video lecture generation (Remotion, D-ID, ElevenLabs), podcasts, GKS scholarship tools, Stripe credits and subscriptions, grounded chat (since rebuilt as the workspace), document upload and RAG, the analytics dashboard, the old marketing site and its assets, and the generated `docs/` tree. Old database tables are not dropped automatically; see `server/db/migrations/2026-11-03-drop-legacy.sql`.

Everything as it was before the removal is kept in the git ref `refs/backup/pre-junbee-2026-11-03`. To restore a file:

```bash
git checkout refs/backup/pre-junbee-2026-11-03 -- path/to/file
```

## Contact

info@preplitai.com · © 2026 Preplit AI, Inc.
