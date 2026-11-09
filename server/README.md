# Junbee API

Express API for the Junbee pilot. See the root `README.md` for setup.

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
| GET | `/api/junbee` | The one undismissed message: `ready`, `unclear` or `failed` |
| POST | `/api/junbee/:lectureId/dismiss` | Dismiss it for good |
| GET | `/api/review/today?since=ISO` | `{ done, cards }` for today's session |
| POST | `/api/review/cards/:id` | `{ rating: 1–4 }` (다시, 어려움, 알맞음, 쉬움) |
| POST | `/api/chat` | `{ question, conversationId?, courseId? }` → a stream of events: `status`, `delta`, `reset`, then `done` or `error`. Saved only on `done` |
| GET | `/api/chat/conversations` | The student's conversations, newest first |
| GET/DELETE | `/api/chat/conversations/:id` | Messages with their citations; or delete |
| GET | `/api/semester?since=ISO` | The semester: current week, every week's state, courses, exams, and what the bee says |
| PUT | `/api/semester` | `{ startsOn, weeks?, fresh? }`; corrects the current semester, or starts a new one when `fresh` |
| GET | `/api/semester/courses/:id` | One course's workspace: weeks, lectures, exam hints, cards |
| GET | `/api/push/config` | Whether notifications are on, and the public key |
| POST | `/api/push/subscribe` | `{ endpoint, keys: { p256dh, auth } }`; real browser push services only |
| POST | `/api/push/unsubscribe` | `{ endpoint }` |

Tests: `npm test` (Node's test runner, PGlite, AI calls stubbed).

Real questions against the real model: `npm run eval:chat` (needs a working `GROQ_API_KEY`; throwaway database). Add questions in `evals/chat-eval.js`, especially real ones from students and any that have gone wrong.
