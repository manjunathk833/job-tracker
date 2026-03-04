# HOSTING.md — Deployment Setup Guide

## Architecture

```
GitHub (private repo: manjunathk833/job-tracker)
  ├── push to dev   ──► CI workflow (build check)
  ├── push to main  ──► Netlify auto-deploy + GitHub Release tag
  ├── Daily 14:30 UTC ──► backup.yml (download zip from Fly.io → commit to backups/)
  └── Daily 15:00 UTC ──► job-alert-cron.yml (fetch listings → write to Fly.io PocketBase)

Netlify (free)
  └── https://<your-app>.netlify.app
        └── React SPA (VITE_PB_URL baked in at build time)
              └── API calls ──► Fly.io PocketBase

Fly.io (free tier, Singapore)
  └── https://manjunath-job-tracker.fly.dev
        └── PocketBase v0.22.20 (Linux AMD64)
              └── SQLite at /pb/pb_data (persistent 1GB volume)
```

---

## One-Time Setup (run in order)

### Prerequisites
- `gh` CLI authenticated: `gh auth status`
- `fly` CLI installed: `brew install flyctl && fly auth signup`
- Project root: `/Users/yeshwinmanjunath/development/job-tracker`

---

### Step 1: Deploy PocketBase to Fly.io

```bash
cd /Users/yeshwinmanjunath/development/job-tracker

# Initialize Fly app using fly.toml already committed
fly launch --no-deploy --copy-config

# Create persistent volume (1GB, Singapore region)
fly volumes create pb_data --region sin --size 1

# Set admin password as Fly secret (never stored in files)
fly secrets set PB_ADMIN_PASSWORD="choose-a-strong-password-here"

# Deploy (first deploy downloads the PocketBase binary — takes ~3 min)
fly deploy

# Confirm it's running
fly status
fly logs
```

On first start, PocketBase auto-replays all migrations from `pocketbase/pb_migrations/`, creating all 5 collections: `applications`, `interviews`, `companies`, `alerts`, `job_listings`.

---

### Step 2: Create PocketBase Admin Account

```bash
# Get your app URL
fly open
# Opens: https://manjunath-job-tracker.fly.dev
```

Navigate to `https://manjunath-job-tracker.fly.dev/_/` in your browser.
PocketBase prompts for admin email + password on first load:
- **Email:** `admin@jobtracker.local` (or anything memorable)
- **Password:** Same password you set in `fly secrets set PB_ADMIN_PASSWORD`

Verify all 5 collections appear in the admin UI under Collections.

---

### Step 3: Seed Alerts (optional but recommended)

Run this pointing at the Fly.io URL to populate SDET/QA alerts:

```bash
VITE_PB_URL=https://manjunath-job-tracker.fly.dev \
  node scripts/seed-alerts.js admin@jobtracker.local your-password
```

---

### Step 4: Configure PocketBase CORS

In the PocketBase admin UI (`/_/`):
1. Settings → Application
2. Under **Allowed origins**, add both:
   - `https://<your-netlify-subdomain>.netlify.app`
   - `http://localhost:5173`
3. Save

Without this, browser requests from Netlify will be blocked by CORS.

---

### Step 5: Add GitHub Secrets

```bash
# Set all at once via gh CLI (recommended):
gh secret set VITE_PB_URL --body "https://manjunath-job-tracker.fly.dev"
gh secret set PB_ADMIN_EMAIL --body "admin@jobtracker.local"
gh secret set PB_ADMIN_PASSWORD   # prompts for value (not echoed)
gh secret set ADZUNA_APP_ID --body "your-adzuna-app-id"
gh secret set ADZUNA_APP_KEY --body "your-adzuna-app-key"
```

| Secret | Description |
|--------|-------------|
| `VITE_PB_URL` | `https://manjunath-job-tracker.fly.dev` |
| `PB_ADMIN_EMAIL` | PocketBase admin email (from Step 2) |
| `PB_ADMIN_PASSWORD` | PocketBase admin password (from Step 1) |
| `ADZUNA_APP_ID` | Adzuna API credentials (optional) |
| `ADZUNA_APP_KEY` | Adzuna API credentials (optional) |

`GITHUB_TOKEN` is auto-provided — do not create it.

---

### Step 6: Deploy Frontend to Netlify

**Option A — Netlify UI (easiest):**
1. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git
2. Connect GitHub → select `manjunathk833/job-tracker`
3. Branch: `main` | Build command: `npm run build` | Publish dir: `dist`
4. Add environment variable: `VITE_PB_URL` = `https://manjunath-job-tracker.fly.dev`
5. Deploy site

**Option B — Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify init   # follow prompts, set build command + publish dir
netlify env:set VITE_PB_URL "https://manjunath-job-tracker.fly.dev"
netlify deploy --prod
```

`netlify.toml` is already committed and Netlify reads it automatically (SPA redirect rule + build config).

---

### Step 7: Verify End-to-End

```bash
# 1. Confirm CI passes
gh run list --workflow=ci.yml --limit 1

# 2. Open your Netlify URL — check DevTools Network tab
#    Filter by 'api' — should see 200s from manjunath-job-tracker.fly.dev

# 3. Test cron manually
gh workflow run job-alert-cron.yml
gh run list --workflow=job-alert-cron.yml --limit 1

# 4. Test backup manually
gh workflow run backup.yml
# After it completes, check: ls backups/
```

---

## Local Development (unchanged)

```bash
npm run dev:all
# Frontend: http://localhost:5173
# PocketBase: http://localhost:8090
```

Local `.env` still controls `VITE_PB_URL` locally (defaults to `http://localhost:8090`).
Fly.io deployment is completely independent — you can run both simultaneously.

---

## Ongoing Maintenance

### Automatic (zero action needed)
| Task | Schedule | Mechanism |
|------|----------|-----------|
| Frontend deploy | On push to `main` | Netlify webhook |
| DB backup | Daily 2:30 PM UTC | `backup.yml` → `backups/YYYY-MM-DD.zip` committed |
| Job alert fetch | Daily 3:00 PM UTC | `job-alert-cron.yml` |
| TLS certificates | Auto-renew | Fly.io managed |
| CI build check | On push to `dev` + PRs | `ci.yml` |

### Monthly Manual Check (~5 min)
```bash
fly status                                    # confirm machine healthy
gh run list --workflow=backup.yml --limit 7   # verify backups succeeded
gh run list --workflow=job-alert-cron.yml --limit 7  # verify cron succeeded
ls backups/                                   # confirm zips accumulating
```

### Update PocketBase version
```bash
# 1. Edit Dockerfile: ARG PB_VERSION=x.y.z
# 2. Commit and push to dev
git commit -am "chore: upgrade PocketBase to vX.Y.Z"
git push origin dev
# 3. Redeploy to Fly.io
fly deploy
```

### Emergency: Restore DB from Backup
```bash
# Option A — PocketBase admin UI
# https://manjunath-job-tracker.fly.dev/_/
# Settings → Backups → Upload → select zip from backups/ folder → Restore

# Option B — API
TOKEN=$(curl -sf -X POST "https://manjunath-job-tracker.fly.dev/api/admins/auth-with-password" \
  -H "Content-Type: application/json" \
  -d '{"identity":"admin@jobtracker.local","password":"your-password"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# First upload the zip, then restore
curl -X POST "https://manjunath-job-tracker.fly.dev/api/backups/restore/backup-2026-03-04.zip" \
  -H "Authorization: Bearer $TOKEN"
```

### If Fly.io Machine Gets Stuck
```bash
fly machine list
fly machine restart
# If that fails:
fly machine stop <machine-id>
fly machine start <machine-id>
```

---

## Security Notes

- Admin password lives only in: `fly secrets` (on Fly.io VM) + GitHub Secrets — never in committed files
- GitHub automatically masks secret values in Action logs — password never appears in output
- PocketBase collections use open rules (no auth required) — acceptable for a private-URL personal app
- CORS restricts browser API calls to only your Netlify domain + localhost — add only these two
- Backups in `backups/` folder contain your full DB — repo is private, this is fine. If repo ever goes public, rotate all data first
- Fly.io auto-provisions HTTPS; `force_https = true` in `fly.toml` ensures no plain HTTP traffic
