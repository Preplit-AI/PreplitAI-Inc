# Preplit AI API

Express API shared by the Preplit AI app and website. See the root `README.md` for setup.

All routes except `/api/health`, `/api/auth/config`, `signup`, `login`, `refresh` and `logout` need `Authorization: Bearer <access token>`.

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/health` | Database reachable or not |
| GET | `/api/auth/config` | Whether sign-up needs an invite code |
| POST | `/api/auth/signup` | `{ email, password, name, inviteCode? }` → session |
| POST | `/api/auth/login` | `{ email, password }` → session |
| POST | `/api/auth/refresh` | Rotates the refresh cookie → session (204 when signed out) |
| POST | `/api/auth/logout` | Ends this session |
| GET | `/api/auth/me` | The signed-in student |
| PUT | `/api/auth/profile` | `{ name }` |
| PUT | `/api/auth/password` | `{ currentPassword, newPassword }`; ends other sessions |
| DELETE | `/api/auth/account` | `{ password }`; deletes everything the account owns |
| GET/POST | `/api/courses` | List, or create `{ name }` |
| PATCH/DELETE | `/api/courses/:id` | Change any of `name`, `classDays`, `midtermOn`, `finalOn`; or delete with its lectures and cards |
| POST | `/api/lectures` | multipart: `courseId`, `title?`, `recordedAt?`, and `audio` (file) or `text` → 202, processed in the background. With no title it is named for its week, like `9주차` |
| GET | `/api/lectures` | Lectures that are processing or ready |
| GET/DELETE | `/api/lectures/:id` | Notes, transcript, cards; or delete |
| GET | `/api/juno` | Juno's one undismissed message about a lecture: `ready`, `unclear` or `failed` |
| POST | `/api/juno/:lectureId/dismiss` | Dismiss it for good |
| GET | `/api/review/today?since=ISO` | `{ done, cards }` for today's session |
| POST | `/api/review/cards/:id` | `{ rating: 1–4 }` (다시, 어려움, 알맞음, 쉬움) |
| POST | `/api/chat` | `{ question, conversationId?, courseId?, lectureId?, mode? }`; `mode: "companion"` (the app's main chat) also lets Juno save, list and complete the student's tasks, reported as `action` events → a stream of events: `status`, `delta`, `reset`, then `done` or `error`. Saved only on `done` |
| GET | `/api/chat/conversations` | The student's conversations, newest first |
| GET/DELETE | `/api/chat/conversations/:id` | Messages with their citations; or delete |
| GET | `/api/semester?since=ISO` | The semester: current week, every week's state, courses, exams, and what the bee says |
| PUT | `/api/semester` | `{ startsOn, weeks?, fresh? }`; corrects the current semester, or starts a new one when `fresh` |
| GET | `/api/semester/courses/:id` | One course's workspace: weeks, lectures, exam hints, cards |
| GET | `/api/push/config` | Whether notifications are on, and the public key |
| POST | `/api/push/subscribe` | `{ endpoint, keys: { p256dh, auth } }`; real browser push services only |
| POST | `/api/push/unsubscribe` | `{ endpoint }` |
| GET/PATCH | `/api/profile` | The student's profile: university, program, year, languages, quiet hours |
| GET/POST | `/api/tasks` | Tasks and deadlines; `?state=open|done|all` |
| PATCH/DELETE | `/api/tasks/:id` | Change, complete or delete a task |
| POST | `/api/tasks/from-image` | multipart `image` (PNG, JPG, WebP) → the deadlines visible in it. Nothing is saved |
| POST | `/api/listen` | `{ courseId }` → start listening to a class |
| POST | `/api/listen/:id/chunk` | multipart `audio`, `seq`, `seconds` → the words in that piece; the audio is deleted |
| POST | `/api/listen/:id/finish` | Save the class as a lecture in its course (202, notes made in the background) |
| DELETE | `/api/listen/:id` | Stop and keep nothing |
| GET | `/api/campus` | The notice board of the student's own university, if it is connected |
| POST | `/api/campus/ingest` | Notices sent by the campus reader; only with `CAMPUS_INGEST_KEY`, and closed (404) when it is not set |
| GET/POST | `/api/community` | The room for the student's university; post `body`, `kind`, `image?` |
| GET/DELETE | `/api/community/:id` | A post with its replies; or delete your own |
| POST | `/api/community/:id/comments`, `/like`, `/report` | Reply, like (again to undo), report |

Tests: `npm test` (Node's test runner, PGlite, AI calls stubbed).

Real questions against the real model: `npm run eval:chat` (needs a working `GROQ_API_KEY`; throwaway database). Add questions in `evals/chat-eval.js`, especially real ones from students and any that have gone wrong.
