# Deploying on Coolify (Docker)

The whole product runs as three containers from `docker-compose.yml`:

| Service | What it is | Built from |
| --- | --- | --- |
| `web` | nginx: the landing and pricing pages, the React app (`/app`, `/login`…), the mobile app's web build at `/m`, and `/api/` passed to `api`. Routes and security headers match `vercel.json` | `Dockerfile.web` |
| `api` | The Express API (`server/`). Stateless: all data is in PostgreSQL, uploads only pass through `/tmp` | `Dockerfile.api` |
| `db` | PostgreSQL 16, with a named volume | `postgres:16-alpine` |

**Live since 21 November 2026:** www.preplitai.com and preplitai.com are served by this stack on the Coolify server (panel.iw12.org, project **Preplit**, AWS Seoul), behind Cloudflare's proxy, with the data on Neon. A push to `main` redeploys it. Vercel still builds from the same repository (`vercel.json`, `api/index.js`) but no longer receives the domain.

## In Coolify

1. New resource → your server → **Docker Compose** → this repository, branch `main`, compose file `docker-compose.yml`.
2. Give the **`web`** service the domain (for example `https://www.preplitai.com`), port **80**. `api` and `db` need no domain.
3. Set the environment variables below, then Deploy. Coolify waits for the health checks: `db`, then `api` (`/api/health`), then `web` (`/healthz`).

Setting values: use **Environment Variables → Developer view**, paste each value after its `NAME=` in the **Production** box and click **Save changes**. The per-variable edit boxes were easy to close without saving, and every variable also has a *Preview deployments* row that the live app ignores. Saved values reach the app only after a redeploy. To check what the app really received, open **Terminal** → the `api` container and print which names are set (`node -e "console.log(Boolean(process.env.CAMPUS_INGEST_KEY))"`), never the values.

## Environment variables

Required:

| Name | What |
| --- | --- |
| `JWT_SECRET` | Long random string (`openssl rand -hex 32`). It signs the 15-minute access tokens only: refresh tokens live in the database, so changing it does not sign anyone out |
| `OPENROUTER_API_KEY` | The language model (Gemini 2.5 Flash through OpenRouter): notes, Juno, screenshots, campus translations, and transcription when the transcription service is unavailable |
| `POSTGRES_PASSWORD` | Password for the bundled database. Required by the compose file even when `DATABASE_URL` points elsewhere |
| `PUBLIC_URL` | The site's address, e.g. `https://www.preplitai.com` (links in e-mails, sign-in redirects) |
| `ALLOWED_ORIGINS` | Comma-separated origins allowed to call the API, e.g. `https://www.preplitai.com,https://preplitai.com` |

Usually also:

| Name | What |
| --- | --- |
| `DATABASE_URL` | Leave empty to use the bundled `db`. Set it to keep using an existing database (the current production data is on Neon) |
| `TRANSCRIBE_INTERNAL_API_KEY` (or `INTERNAL_API_KEY`) | Key for the Preplit transcription service (`https://transcribe.iw12.org`, override with `TRANSCRIBE_SERVICE_URL`). Lecture Buddy sends each recorded class there once, as one job, and asks for an English translation; without it the AI model transcribes |
| `CAMPUS_INGEST_KEY` | The campus reader's key (see [campus-reader/](campus-reader/README.md)). Same value as on the Cloudflare Worker |
| `TRUST_PROXY` | Proxies in front of the API. Default `2` (Coolify's proxy, then nginx). `3` if Cloudflare also proxies the domain (orange cloud), as it does for preplitai.com |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in. Add `https://<domain>/api/auth/google/callback` to the OAuth client's redirect URIs |
| `RESEND_API_KEY`, `EMAIL_FROM` | Password-reset e-mails |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Web push |
| `MAX_AUDIO_MB` | Largest lecture upload, default 200 |
| `GEMINI_API_KEY`, `GROQ_API_KEY` | Other language-model providers, used only without `OPENROUTER_API_KEY` |
| `TRANSCRIBE_MODEL`, `NOTES_MODEL`, `CHAT_MODEL`, `VISION_MODEL`, `FALLBACK_MODELS` | Model names; empty means `google/gemini-2.5-flash` |
| `MONTHLY_LECTURE_LIMIT`, `MONTHLY_CHAT_LIMIT`, `DAILY_REVIEW_LIMIT`, `PROCESSING_CONCURRENCY`, `NOTES_PART_CHARS` | Limits; empty means the defaults in `server/config/constants.js` |
| `PGSSL` | `disable` or `require` to override: by default a database on `localhost` or the container network is reached without TLS, anything else with it |

## Moving from Vercel

- **Database.** To keep every account and lecture, set `DATABASE_URL` to the current Neon URL. To move onto the bundled database instead, copy the data first: `pg_dump "<neon url>" | docker compose exec -T db psql -U preplit preplit` (with the stack up, before anyone signs up). The API creates and updates its tables itself on start.
- **Keys.** Vercel will not show or `vercel env pull` values marked Sensitive (they come back as `[SENSITIVE]`). Take each from its source instead: the transcription key is `INTERNAL_API_KEY` in Coolify's Preplit-Transcribe app; the Google pair from Google Cloud Console (add a new client secret); a new `CAMPUS_INGEST_KEY` must also be set on the Worker (below).
- **Domain.** Add `https://www.preplitai.com` and `https://preplitai.com` (port 80) to the `web` service, set `PUBLIC_URL=https://www.preplitai.com` and `ALLOWED_ORIGINS` to both, redeploy, then point both Cloudflare records at the server (`preplitai.com` A → server IP, `www` CNAME → `preplitai.com`), proxied, SSL mode Full or Full (strict). Coolify's proxy gets its Let's Encrypt certificate once the records resolve; redeploy if it has not after a few minutes. `PUBLIC_URL` must be an address Google lists as a redirect URI, or Google sign-in answers `redirect_uri_mismatch`. The mobile app and the campus reader both call `https://www.preplitai.com`, so neither needs changing.
- **Lecture uploads.** On Vercel, whole-file lecture uploads answer 501 (a serverless limit); on this server they work (up to `MAX_AUDIO_MB`). Lecture Buddy recordings work on both, and here a long class has no function time limit.
- **Campus board.** Keep `CAMPUS_INGEST_KEY` set, with the same value as the Worker's secret (Cloudflare → Workers & Pages → preplit-campus-reader → Settings → Variables and Secrets), and the Worker keeps feeding Ajou's notices every hour. (Ajou's site refuses Amazon and Microsoft networks. A Coolify server elsewhere may reach it directly, but the Worker does not depend on that.)

## Without Coolify

```bash
docker compose up -d --build
```

with the variables in a `.env` file beside `docker-compose.yml` (never commit it). The `web` container listens on port 80 inside the compose network; publish it with `ports: ["80:80"]` or put your own proxy in front.

`.github/workflows/docker.yml` builds both images and runs the stack on every change to these files: pages through nginx, the API's health, a sign-up.
