# HOSTING.md — Deployment Guide

## Architecture

```
Your Mac (always-on when you want access)
  └── PocketBase  :8090  ──► ngrok tunnel ──► https://your-domain.ngrok-free.app
                                                        │
Netlify (frontend, free)                                │
  └── https://your-app.netlify.app                      │
        └── React SPA (VITE_PB_URL baked at build) ─────┘
```

- **Frontend**: Netlify serves the static React build. Free, auto-deploys on push to `main`.
- **Backend**: PocketBase runs on your Mac. Exposed publicly via ngrok when you want remote access.
- **Cost**: $0 everywhere.

---

## One-Time Setup

### Step 1 — Get a free ngrok static domain

ngrok gives you one free permanent subdomain (e.g. `leopard-sunny-fox.ngrok-free.app`). This is the stable URL Netlify will use to reach your local PocketBase.

1. Create a free account at https://dashboard.ngrok.com/signup
2. Get your authtoken from https://dashboard.ngrok.com/authtokens
3. Claim your free static domain at https://dashboard.ngrok.com/domains → **New Domain**
4. Install ngrok:
   ```bash
   brew install ngrok/ngrok/ngrok
   ```
5. Authenticate:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```
6. Test your tunnel (PocketBase must be running first):
   ```bash
   npm run dev:all   # start PocketBase + frontend

   # In a separate terminal:
   ngrok http --domain=YOUR_DOMAIN.ngrok-free.app 8090
   ```
   Visit `https://YOUR_DOMAIN.ngrok-free.app/_/` — you should see the PocketBase admin panel.

### Step 2 — Add your ngrok domain to `.env`

```bash
# Edit .env and set:
NGROK_DOMAIN=YOUR_DOMAIN.ngrok-free.app
```

After this, `npm run dev:tunnel` starts frontend + PocketBase + ngrok all at once:

```bash
npm run dev:tunnel
```

### Step 3 — Configure PocketBase CORS

PocketBase needs to allow requests from your Netlify domain. Do this once:

1. Open http://localhost:8090/_/ → log in as admin
2. Go to **Settings** → **Application**
3. Under **Allowed origins**, add:
   - `https://YOUR_APP.netlify.app` (add after you know your Netlify URL — Step 4)
   - `http://localhost:5173`
4. Save

### Step 4 — Deploy frontend to Netlify

**Option A — Netlify UI (easiest):**

1. Go to https://app.netlify.com → **Add new site** → **Import an existing project**
2. Connect GitHub → select `manjunathk833/job-tracker`
3. Settings:
   - Branch: `main`
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variable:
   - Key: `VITE_PB_URL`
   - Value: `https://YOUR_DOMAIN.ngrok-free.app`
5. Click **Deploy site**

**Option B — Netlify CLI:**

```bash
npm install -g netlify-cli
netlify login
netlify init          # connect to GitHub repo
netlify env:set VITE_PB_URL "https://YOUR_DOMAIN.ngrok-free.app"
netlify deploy --prod
```

After deploy, copy your Netlify URL (e.g. `https://job-tracker-abc123.netlify.app`) and go back to **Step 3** to add it to PocketBase CORS.

### Step 5 — Verify end-to-end

1. Start everything: `npm run dev:tunnel`
2. Open your Netlify URL from your phone or another device
3. You should see the app and be able to load applications/alerts
4. Turn off the tunnel (`Ctrl+C`) — the app on Netlify should show empty/error state (expected — backend is offline)

---

## Daily Usage

**When you want the app accessible from anywhere:**

```bash
npm run dev:tunnel
# Starts: Vite frontend (:5173) + PocketBase (:8090) + ngrok tunnel
# Netlify URL works from phone, other machines, anywhere
```

**When you only need local access:**

```bash
npm run dev:all
# Starts: Vite frontend (:5173) + PocketBase (:8090)
# localhost:5173 only — Netlify URL won't work (PocketBase not reachable)
```

---

## How VITE_PB_URL Works

Vite bakes `VITE_PB_URL` into the JS bundle at build time. This means:

- Netlify build uses `https://YOUR_DOMAIN.ngrok-free.app` → works from any device when your Mac + tunnel are running
- Local dev uses `http://localhost:8090` → works only from the same machine

Your ngrok static domain never changes (unlike quick tunnels), so you only need to redeploy Netlify if you change domains.

---

## GitHub Actions (optional)

`job-alert-cron.yml` and `backup.yml` will also work once you add GitHub Secrets:

```bash
gh secret set VITE_PB_URL --body "https://YOUR_DOMAIN.ngrok-free.app"
gh secret set PB_ADMIN_EMAIL --body "your@email.com"
gh secret set PB_ADMIN_PASSWORD   # prompts (not echoed)
gh secret set ADZUNA_APP_ID       # optional
gh secret set ADZUNA_APP_KEY      # optional
```

The cron and backup jobs will succeed as long as your Mac + tunnel are running at the scheduled time (3:00 PM UTC for cron, 2:30 PM UTC for backup).

---

## Local Dev (unchanged)

```bash
npm run dev:all
# Frontend: http://localhost:5173
# PocketBase: http://localhost:8090 (admin: /_/)
```

---

## Troubleshooting

**Netlify shows blank / API errors:**
→ Your Mac or ngrok tunnel is not running. Start `npm run dev:tunnel`.

**ngrok shows "domain not found" or "unauthorized":**
→ Run `ngrok config add-authtoken YOUR_AUTHTOKEN` again.

**PocketBase CORS error in browser console:**
→ Add your Netlify domain to PocketBase → Settings → Application → Allowed origins.

**`npm run dev:tunnel` fails with "ngrok: command not found":**
→ Install ngrok: `brew install ngrok/ngrok/ngrok`

**ngrok tunnel URL shows but PocketBase admin 404s:**
→ Make sure PocketBase is running on :8090 first (`npm run dev:all` or `npm run dev:pb`).
