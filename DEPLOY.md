# Deploying on Coolify (Docker)

The whole product runs as three containers from `docker-compose.yml`:

| Service | What it is | Built from |
| --- | --- | --- |
| `web` | nginx: the landing and pricing pages, the React app (`/app`, `/login`…), the mobile app's web build at `/m`, and `/api/` passed to `api`. Routes and security headers match `vercel.json` | `Dockerfile.web` |
| `api` | The Express API (`server/`). Stateless: all data is in PostgreSQL, uploads only pass through `/tmp` | `Dockerfile.api` |
| `db` | PostgreSQL 16, with a named volume | `postgres:16-alpine` |

Vercel keeps working from the same repository (`vercel.json`, `api/index.js`); nothing here changes it.

## In Coolify

1. New resource → your server → **Docker Compose** → this repository, branch `main`, compose file `docker-compose.yml`.
2. Give the **`web`** service the domain (for example `https://www.preplitai.com`), port **80**. `api` and `db` need no domain.
3. Set the environment variables below, then Deploy. Coolify waits for the health checks: `db`, then `api` (`/api/health`), then `web` (`/healthz`).

## Environment variables

Required:

| Name | What |
| --- | --- |
| `JWT_SECRET` | Long random string (`openssl rand -hex 32`). Changing it signs everyone out |
| `GROQ_API_KEY` | Transcription, notes, Juno, screenshots, campus translations |
| `POSTGRES_PASSWORD` | Password for the bundled database. Required by the compose file even when `DATABASE_URL` points elsewhere |
| `PUBLIC_URL` | The site's address, e.g. `https://www.preplitai.com` (links in e-mails, sign-in redirects) |
| `ALLOWED_ORIGINS` | Comma-separated origins allowed to call the API, e.g. `https://www.preplitai.com,https://preplitai.com` |

Usually also:

| Name | What |
| --- | --- |
| `DATABASE_URL` | Leave empty to use the bundled `db`. Set it to keep using an existing database (the current production data is on Neon) |
| `TRANSCRIBE_INTERNAL_API_KEY` (or `INTERNAL_API_KEY`) | Key for the Preplit transcription service (`https://transcribe.iw12.org`, override with `TRANSCRIBE_SERVICE_URL`). Lecture Buddy sends each recorded class there once, as one job, and asks for an English translation; without it the AI model transcribes |
| `CAMPUS_INGEST_KEY` | The campus reader's key (see [campus-reader/](campus-reader/README.md)). Same value as on the Cloudflare Worker |
| `TRUST_PROXY` | Proxies in front of the API. Default `2` (Coolify's proxy, then nginx). `3` if Cloudflare also proxies the domain (orange cloud) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in. Add `https://<domain>/api/auth/google/callback` to the OAuth client's redirect URIs |
| `RESEND_API_KEY`, `EMAIL_FROM` | Password-reset e-mails |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Web push |
| `MAX_AUDIO_MB` | Largest lecture upload, default 200 |
| `PGSSL` | `disable` or `require` to override: by default a database on `localhost` or the container network is reached without TLS, anything else with it |

## Moving from Vercel

- **Database.** To keep every account and lecture, set `DATABASE_URL` to the current Neon URL. To move onto the bundled database instead, copy the data first: `pg_dump "<neon url>" | docker compose exec -T db psql -U preplit preplit` (with the stack up, before anyone signs up). The API creates and updates its tables itself on start.
- **Domain.** Point the domain's DNS at the Coolify server, or change the Cloudflare DNS record if Cloudflare proxies it. The mobile app and the campus reader both call `https://www.preplitai.com`, so neither needs changing.
- **Lecture uploads.** On Vercel, whole-file lecture uploads answer 501 (a serverless limit); on this server they work (up to `MAX_AUDIO_MB`). Live listening works on both.
- **Campus board.** Keep `CAMPUS_INGEST_KEY` set and the Cloudflare Worker keeps feeding Ajou's notices. (Ajou's site refuses Amazon and Microsoft networks. A Coolify server elsewhere may reach it directly, but the Worker does not depend on that.)

## Without Coolify

```bash
docker compose up -d --build
```

with the variables in a `.env` file beside `docker-compose.yml` (never commit it). The `web` container listens on port 80 inside the compose network; publish it with `ports: ["80:80"]` or put your own proxy in front.

`.github/workflows/docker.yml` builds both images and runs the stack on every change to these files: pages through nginx, the API's health, a sign-up.
