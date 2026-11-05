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
| PATCH/DELETE | `/api/courses/:id` | Rename, or delete with its lectures and cards |
| POST | `/api/lectures` | multipart: `courseId`, `title?`, and `audio` (file) or `text` → 202, processed in the background |
| GET | `/api/lectures` | Lectures that are processing or ready |
| GET/DELETE | `/api/lectures/:id` | Notes, transcript, cards; or delete |
| GET | `/api/junbee` | The one undismissed message: `ready`, `unclear` or `failed` |
| POST | `/api/junbee/:lectureId/dismiss` | Dismiss it for good |
| GET | `/api/review/today?since=ISO` | `{ done, cards }` for today's session |
| POST | `/api/review/cards/:id` | `{ rating: 1–4 }` (다시, 어려움, 알맞음, 쉬움) |

Tests: `npm test` (Node's test runner, PGlite, AI calls stubbed).
