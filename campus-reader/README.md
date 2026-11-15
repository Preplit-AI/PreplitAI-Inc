# Campus reader

Reads the universities' notice boards every 3 hours and sends the notices to the API, which translates and stores them for the Campus tab. It runs as a free Cloudflare Worker.

## Why it doesn't run inside the API

Ajou's website does not answer the big cloud networks. Tested on 2026-11-15:

| From | Result |
| --- | --- |
| Vercel (Amazon), Washington and Seoul | refused (connection times out) |
| GitHub Actions (Microsoft) | refused (connection times out) |
| **Cloudflare Workers** | **all four boards load (56 notices)** |
| 53 of 55 smaller hosting networks worldwide, including Hetzner in Germany | page loads in 1–5 s |
| A home connection in Korea | page loads in 0.2 s |

So when `CAMPUS_INGEST_KEY` is set, the API on Vercel never reads the boards itself. The Worker reads each board one page at a time and posts the notices to `POST /api/campus/ingest` with that key. The API keeps only notices whose link points to the board they came from.

The reading and sending code is the server's own (`server/services/campusBoards.js` and `campusSend.js`); the Worker in `worker/` only runs it on a schedule. The Worker has no public address.

## Set it up (about 10 minutes, free)

You need Node 22 and the Cloudflare account that holds preplitai.com. Run the commands from the repository's folder.

1. **Make a key** and keep the output somewhere safe (a password manager):

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Give the key to Vercel.** Project `preplit-ai-inc` → Settings → Environment Variables → add `CAMPUS_INGEST_KEY` (Production) with that value, then redeploy (Deployments → ⋯ → Create Deployment → `main`).

3. **Install the Worker's tools and sign in to Cloudflare** (a browser window opens to approve):

   ```bash
   npm --prefix campus-reader/worker install
   ```

   ```bash
   npm --prefix campus-reader/worker exec wrangler login
   ```

4. **Deploy the Worker:**

   ```bash
   npm --prefix campus-reader/worker run deploy
   ```

5. **Give the key to the Worker.** It asks for the value; paste the key from step 1:

   ```bash
   npm --prefix campus-reader/worker run key
   ```

The Worker runs at 17 minutes past every third hour (UTC), so the first run comes within 3 hours. Its output (`read ajou-oia: 13 notices` … `sent: 56 notices from 4 boards`) appears in the Cloudflare dashboard under Workers & Pages → `preplit-campus-reader` → Observability → Logs, or live with:

```bash
npm --prefix campus-reader/worker run logs
```

The Campus tab shows the notices a minute later (titles are translated just after they arrive).

## Looking after it

- A run that could not read a campus or was refused by the API fails with an error in the Worker's logs. The board keeps showing the last notices it had.
- After adding a campus or changing `campusBoards.js` or `campusSend.js`, deploy again (step 4).
- Changing the key: set the new value in Vercel and run step 5 again.
- Trying it on your computer: put `CAMPUS_INGEST_KEY=...` and `CAMPUS_INGEST_URL=http://localhost:5000/api/campus/ingest` in `campus-reader/worker/.dev.vars` (ignored by git), start the API with the same key, then run `npm --prefix campus-reader/worker run dev` and open `http://localhost:8787/__scheduled`.

## If Cloudflare ever stops working

The same code runs anywhere Node 22 runs:

- **Your own computer** (a home connection in Korea reaches Ajou):

  ```bash
  CAMPUS_INGEST_KEY=the-key npm --prefix server run campus:read
  ```

- **A small rented server** not on Amazon, Microsoft or Google (Hetzner's CX22, about €4 a month, is on a network known to reach Ajou). Copy the files and run the installer, which checks first that the server reaches Ajou, asks for the key and schedules the reader every 3 hours:

  ```bash
  scp server/scripts/campusReader.js server/services/campusSend.js server/services/campusBoards.js campus-reader/install.sh root@SERVER_IP:/root/
  ```

  ```bash
  ssh -t root@SERVER_IP "cd /root && sh install.sh"
  ```

Without `CAMPUS_INGEST_KEY` in its environment, a local API reads the boards itself, as before.
