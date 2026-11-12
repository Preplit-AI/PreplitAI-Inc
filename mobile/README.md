# Preplit AI: the mobile app

One Expo (React Native) project for Android phones and tablets, iPhones and iPads, and the web.
Juno, the student's companion, runs through all of it.

This is the first milestone of the product vision (`PREPLIT_Complete_Product_Vision.md`): the
usable academic foundation. It is not the whole vision. The **status matrix** below says exactly
what works, what is partial and what has not been started.

## Try it

| Where | How |
|---|---|
| In a browser, on any phone or tablet | https://www.preplitai.com/m/?dev=1 |
| On your phone, as a native app | `npm start` in this folder, then scan the QR code with **Expo Go** |

The web version sits behind the same early-access pass as the website's workspace: `?dev=1` lets
this device in and is remembered; `?dev=0` removes it.

## The journey this milestone delivers

Sign up → onboarding (language, university, program, semester, courses, goals) → Home → open a
course workspace → add a lecture with Lecture Buddy (a PDF, a text file or pasted text) → read the
notes and key terms → ask Juno about it → take the quiz → add a task with a reminder → see Home
update.

Every step uses the real API and the real database. Nothing on screen is a mock.

## Run it

```bash
cd mobile
npm install
npm start                 # Expo dev server: scan the QR code with Expo Go, or press a / i / w
npm run typecheck         # tsc --noEmit
npm run export:web        # web build into mobile/dist
```

From the repository root:

```bash
npm run mobile:web        # builds the web version and copies it to public/m, where /m serves it
npx vitest run src/test/mobile.test.ts   # the app's own logic
cd server && npm test     # the API, including what the app added (tests/student.test.js)
```

`public/m` is committed on purpose: the website's deploy never depends on the app building. After
changing anything in `mobile/`, run `npm run mobile:web` and commit `public/m` with the change.

### Settings

Copy `.env.example` to `.env` if you need to change where the API is. No secret belongs in this
app: every key (the model, Google, e-mail) lives on the server.

| Variable | Meaning | Default |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Where the API is | the same site on the web; `https://www.preplitai.com` in the installed app |

## Architecture

```
mobile/                          the app (Expo SDK 58, React Native 0.88, TypeScript, Expo Router)
  src/app/                       one file per screen; _layout.tsx files are the navigators
    _layout.tsx                  fonts, data cache, language, sign-in state, which screens are reachable
    welcome, login, signup       before signing in
    onboarding                   the Student Intelligence Profile, six steps, saved as it goes
    (tabs)/                      Home, Courses, Lecture Buddy, Career (+ Juno's button)
    course/[id]                  a course workspace
    lecture/[id]                 one lecture's notes (split with Juno on tablets)
    quiz, juno, tasks, profile, project/[id]
  src/lib/                       no UI: api, auth, queries, i18n, theme, format, quiz, data, types
  src/ui/                        the design system and the parts screens share
  assets/juno/                   Juno's six moods, exported from the website's drawing

server/                          the API (Express + PostgreSQL), shared with the website
  routes/profile|tasks|projects  added for the app
  services/profileStore          the profile, also read by Juno's chat
  services/documents             PDF and text files → text (unpdf)
  services/chatAgent             Juno's prompt: persona and rules unchanged, plus who the student
                                 is, the language to answer in, and a career mode
  services/lectureService        notes in the student's language, with the lecture's terms kept
  utils/keepAlive                lets a lecture finish processing after the response on Vercel
```

**Data flow.** Screens read and write through `src/lib/queries.ts` (TanStack Query) → `src/lib/api.ts`
→ `/api`. The access token lives in memory for fifteen minutes; the session is an httpOnly cookie
the app cannot read. Every row on the server is scoped to the signed-in student, and that is
tested (`server/tests/student.test.js`, `api.test.js`).

**Long work.** A lecture is processed after the upload request has answered. On the long-running
server that is a job queue; on Vercel the function is kept alive with `waitUntil` until the notes
are saved. The app shows the real state (processing → ready, or failed) by asking again every few
seconds. A lecture stuck for fifteen minutes is recorded as failed, never left "processing".

**Languages.** Three are kept apart: the app's language (English or Korean), the language Juno
explains in (26 to choose from), and the language a course is taught in. Notes, answers and quiz
questions are written in the student's language with the lecture's own terms kept beside them,
for example 교착 상태 (deadlock).

**Tablets.** From 768 pt wide the tabs become a side rail, Home, Courses, Lecture Buddy and Career
go to two columns, sheets become centred cards, and a lecture shows its notes and Juno side by side.

### Data model added (server/db/database.js)

Applied automatically when the API starts; every statement is `IF NOT EXISTS`.

| Table / columns | Holds |
|---|---|
| `student_profiles` | the Student Intelligence Profile, one typed column per answer |
| `courses.code, instructor, credits, location, starts_at, ends_at, language` | timetable details |
| `lectures.material` | what a lecture was made from (pdf, text) |
| `tasks` | tasks and deadlines, optionally for a course, with a reminder offset |
| `projects`, `project_milestones` | projects and their steps |

Skills have no table: a skill's evidence level is worked out from the student's projects, so it
cannot be claimed without the work behind it.

## Status

**Complete** means it works against the real API and was exercised in a browser. **Not verified
on a device** applies to everything: no phone or simulator was available, so the installed app has
been bundled for Android and iOS but never run on one.

| Capability | Status | Notes |
|---|---|---|
| Sign up, log in, log out (e-mail) | Complete | |
| Sign in with Google | Complete on the web · **Blocked** in the installed app | The installed app needs its own Google OAuth clients (Android and iOS). Until then it shows no Google button. |
| Forgot password | Not started in the app | Works on the website once Resend is configured |
| Onboarding and profile | Complete | Six steps, saved per step, resumes where the student left, editable later |
| Courses and timetable | Complete | List and week view; add, edit, delete |
| Course workspace | Complete (personal) | Shared workspaces: not started |
| Home / Today | Complete | Classes, urgent tasks, review, exams, latest notes, Juno's line |
| Tasks and deadlines | Complete | Create, edit, complete, delete, per course |
| Reminders | **Partial** | The reminder time is saved and shows on Home when due. Phone notifications: not started |
| Weekly plan proposed by Juno | Not started | |
| Lecture Buddy: PDF, text file, pasted text | Complete | Up to 4 MB on the current host |
| Lecture Buddy: recordings | **Blocked** | Needs the long-running audio server (ffmpeg + storage). The app says so and offers no button |
| Live lecture capture | Not started | Needs legal and technical review first |
| Notes, key terms, exam flags | Complete | Written by the model configured on the server (Groq) |
| Bilingual explanations | Complete | Verified: Korean lecture → Vietnamese notes with Korean terms and English equivalents |
| Juno chat, grounded with sources | Complete | Streams; sources open the cited passage; says when an answer is not from the lectures |
| Juno's memory, viewable and editable | **Partial** | The profile is fully visible and editable. Conversation history is kept on the server but has no screen yet |
| Juno actions (create a task for me) | Not started | Juno reads; he does not change anything |
| Quiz / mini-game | Complete | Multiple choice from the student's own cards; each answer feeds the review schedule |
| Spaced review | Complete | FSRS, in `server/services/scheduler.js` |
| Weak-topic view | **Partial** | Missed questions return sooner and are listed after a quiz. No standing "weak topics" screen |
| Projects and milestones | Complete | Finishing needs a link or a write-up |
| Skills with evidence levels | Complete for demonstrated / developing / wanted | "Introduced" and "practiced" (from coursework) need skill mapping: not started |
| Project ideas from Juno | Complete | Career mode: reads the student's real courses first |
| Portfolio, public sharing | Not started | |
| Career Connection (opportunities) | Not started | Needs real, sourced listings |
| Campus Intelligence, Explore, Community | Not started | No tab is shown for them |
| Tablet layouts | Complete | Checked at 1024×768 and 820×1180 |
| Korean interface | Complete | |
| Offline use | Not started | Needs a connection; a failed request offers "Try again" |
| Account deletion | On the website | The profile screen says where |
| Store builds (TestFlight, Play) | Not started | Needs Apple and Google developer accounts and EAS |

Nothing in the app uses mock data.

## Testing

| Check | Command | Result |
|---|---|---|
| Type check | `npm run typecheck` | clean |
| App logic (quiz, dates, onboarding suggestions) | `npx vitest run` at the root | 108 passed (11 for the app) |
| API | `cd server && npm test` | 119 passed (7 for what the app added) |
| Web build | `npm run mobile:web` | 68 files, 2.8 MB |
| Android and iOS bundles | `npx expo export --platform android --platform ios` | both compile |
| The whole journey in a browser, 390×844 | Playwright against the real API and model | passed |
| Tablet layouts, 1024×768 and 820×1180 | Playwright | passed |
| On a phone or tablet | | **not done** |

The browser run covered: the early-access wall, welcome, sign-up with the consent guard, all six
onboarding steps, leaving and resuming onboarding, Home, adding a course, pasted-text and PDF
lectures through to notes, the quiz, Juno with a cited answer and its source, a task with a
reminder, completing and reopening it, a project from idea to finished (refused without evidence),
the profile, log out, log in, Google sign-up, and the Korean interface.

## Design system

Defined in `src/lib/theme.ts` and `src/ui/index.tsx`; screens use only these.

- **Colour.** The website's palette: ink on paper, bone for quiet surfaces, the logo's maroon for
  what is urgent and gold for Juno and review. Each course gets one soft tint, the same everywhere.
- **Type.** Schibsted Grotesk (400, 500, 600, 700); Korean and other scripts fall back to the
  system font. Seven text styles; nothing smaller than 12 pt.
- **Controls.** Every control is at least 44 pt tall. Primary actions are ink pills, one per screen,
  pinned above the keyboard.
- **Parts.** `Screen`, `Card`, `Section`, `Row`, `Button`, `Field`, `Chip`, `Segment`, `Toggle`,
  `Sheet`, `Notice`, `Badge`, `ProgressBar`, and Juno (`Juno`, `JunoFigure`, `JunoSays`, `Empty`).
- **States.** Every list has a loading, an empty and a failed state; a failed request says so and
  offers to try again.
- **Juno.** One drawing, six moods, exported from `src/brand/Juno.tsx` at the repository root and
  kept identical by `src/test/juno.test.tsx`.

## Decisions made, and how to undo them

| Decision | Why | To change it |
|---|---|---|
| React Native with Expo | One codebase for both stores and the web; reuses the existing TypeScript API types | |
| The web build is committed to `public/m` | The website's deploy cannot be broken by the app's build | Build it on Vercel instead and delete `public/m` |
| The name shown is "Preplit AI" | The website's spelling (decided 9 November) | `expo.name` in `app.json`, `appName` in `src/lib/i18n.tsx` |
| Reminders show in the app, not as notifications | Notifications need a device to verify and a push service | Add `expo-notifications`; the reminder times are already stored |
| Recordings are refused on Vercel | No ffmpeg, a 4.5 MB request limit, and time limits | Run `server/index.js` on a long-running host with storage |
| Quiz answers rate the card (right = good, wrong = again) | Keeps one review schedule for the website and the app | `useRateCard` in `src/lib/queries.ts` |
| Timezone is saved at onboarding | For reminders and "today" | It is one field of the profile |

## Before production

- Run it on real devices, with a screen reader and at large text sizes.
- A privacy review for South Korea (PIPA) with counsel, including the consent text and overseas
  processing by the model provider.
- Lecture recording: permission, consent and university rules, before any recording feature ships.
- Google OAuth clients for Android and iOS; Apple requires "Sign in with Apple" beside Google.
- Phone notifications, the audio server, and file storage.

## Next

1. Device testing, then store test builds (EAS, TestFlight, Play internal testing).
2. Phone notifications for task reminders and the daily quiz.
3. The audio server and storage, then recordings in Lecture Buddy.
4. Juno proposing tasks and a weekly plan from uploaded material, each one confirmed by the student.
5. Skill mapping from coursework ("introduced", "practiced"), then the portfolio.
6. Shared course workspaces, with permissions and reporting first.
7. Campus information and Explore, from official sources only.
