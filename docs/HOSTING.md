# HOSTING.md — Deployment Setup Guide

## Architecture

```
GitHub (public repo: manjunathk833/job-tracker)
  ├── push to main    ──► Netlify auto-deploy + GitHub Release tag
  ├── Daily 14:30 UTC ──► backup.yml (download zip from PocketHost → commit to backups/)
  └── Daily 15:00 UTC ──► job-alert-cron.yml (fetch listings → write to PocketHost PocketBase)

Netlify (free, no credit card)
  └── https://<your-app>.netlify.app
        └── React SPA (VITE_PB_URL baked in at build time)
              └── API calls ──► PocketHost.io

PocketHost.io (free, no credit card)
  └── https://<your-instance>.pockethost.io
        └── Managed PocketBase — no binary, no Docker, no server config
              └── SQLite managed by PocketHost (persistent)
```

**Cost: $0. No credit card required anywhere.**

---

## One-Time Setup (run in order)

### Prerequisites
- `gh` CLI authenticated: `gh auth status`
- Project root: `/Users/yeshwinmanjunath/development/job-tracker`
- PocketBase running locally for reference: `npm run dev:all`

---

### Step 1: Create a PocketHost Account

1. Go to [pockethost.io](https://pockethost.io) and sign up (email only, no credit card)
2. Create a new instance — choose any name (e.g. `manjunath-job-tracker`)
3. Your PocketBase URL will be: `https://manjunath-job-tracker.pockethost.io`
4. PocketHost manages the PocketBase binary — no Docker or server needed

---

### Step 2: Initialize the PocketHost Instance

Run `setup-pb.js` pointing at your PocketHost URL to create all collections and seed sample data:

```bash
VITE_PB_URL=https://manjunath-job-tracker.pockethost.io \
  node scripts/setup-pb.js your@email.com yourpassword
```

The admin email/password here is the one you set when creating the PocketHost instance (via the PocketHost dashboard).

Verify all 5 collections appear:
- applications, interviews, companies, alerts, job_listings

**Optional:** Seed comprehensive SDET/QA alerts:
```bash
VITE_PB_URL=https://manjunath-job-tracker.pockethost.io \
  node scripts/seed-alerts.js your@email.com yourpassword
```

---

### Step 3: Configure PocketBase CORS

In the PocketHost dashboard, open your instance's PocketBase admin UI (`/_/`):
1. Settings → Application
2. Under **Allowed origins**, add:
   - `https://<your-netlify-subdomain>.netlify.app`
   - `http://localhost:5173`
3. Save

---

### Step 4: Add GitHub Secrets

```bash
# Set all via gh CLI:
gh secret set VITE_PB_URL --body "https://manjunath-job-tracker.pockethost.io"
gh secret set PB_ADMIN_EMAIL --body "your@email.com"
gh secret set PB_ADMIN_PASSWORD      # prompts (not echoed)
gh secret set ADZUNA_APP_ID --body "your-adzuna-app-id"
gh secret set ADZUNA_APP_KEY --body "your-adzuna-app-key"
```

| Secret | Description |
|--------|-------------|
| `VITE_PB_URL` | `https://your-instance.pockethost.io` |
| `PB_ADMIN_EMAIL` | PocketHost instance admin email |
| `PB_ADMIN_PASSWORD` | PocketHost instance admin password |
| `ADZUNA_APP_ID` | Adzuna API credentials (optional — register free at developer.adzuna.com) |
| `ADZUNA_APP_KEY` | Adzuna API credentials (optional) |

`GITHUB_TOKEN` is auto-provided by GitHub Actions — never create it manually.

> **Note:** Because the GitHub repo is public, Actions workflows get **unlimited free minutes** (vs 2,000/month for private repos).

---

### Step 5: Deploy Frontend to Netlify

**Option A — Netlify UI (simplest):**
1. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git
2. Connect GitHub → select `manjunathk833/job-tracker`
3. Branch: `main` | Build command: `npm run build` | Publish dir: `dist`
4. Add environment variable: `VITE_PB_URL` = `https://manjunath-job-tracker.pockethost.io`
5. Deploy site

**Option B — Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set VITE_PB_URL "https://manjunath-job-tracker.pockethost.io"
netlify deploy --prod
```

`netlify.toml` is already committed — Netlify reads it automatically for the SPA redirect rule and build config.

---

### Step 6: Verify End-to-End

```bash
# 1. Check CI passes
gh run list --workflow=ci.yml --limit 1

# 2. Open Netlify URL — DevTools → Network → filter 'api'
#    Should see 200s from your-instance.pockethost.io

# 3. Test job alert cron manually
gh workflow run job-alert-cron.yml
gh run list --workflow=job-alert-cron.yml --limit 1

# 4. Test backup manually
gh workflow run backup.yml
# After completion: ls backups/  → should see backup-YYYY-MM-DD.zip
```

---

## Local Development (unchanged)

```bash
npm run dev:all
# Frontend: http://localhost:5173
# PocketBase: http://localhost:8090 (local binary)
```

Local `.env` controls `VITE_PB_URL` — defaults to `http://localhost:8090`.
PocketHost deployment is completely independent of local dev.

---

## Ongoing Maintenance

### Automatic (zero action needed)
| Task | Schedule | Mechanism |
|------|----------|-----------|
| Frontend deploy | On push to `main` | Netlify webhook |
| DB backup | Daily 2:30 PM UTC | `backup.yml` → `backups/YYYY-MM-DD.zip` committed |
| Job alert fetch | Daily 3:00 PM UTC | `job-alert-cron.yml` |
| TLS certificates | Auto-renew | PocketHost + Netlify managed |
| CI build check | On push to `dev` + PRs | `ci.yml` |

### Monthly Manual Check (~5 min)
```bash
gh run list --workflow=backup.yml --limit 7       # verify backups succeeded
gh run list --workflow=job-alert-cron.yml --limit 7  # verify cron succeeded
ls backups/                                        # confirm zips accumulating
```

### Emergency: Restore DB from Backup

**Option A — PocketHost dashboard:**
1. Open your instance admin UI (`/_/`)
2. Settings → Backups → Upload → select zip from `backups/` folder → Restore

**Option B — API:**
```bash
# Get token
TOKEN=$(curl -sf -X POST "https://your-instance.pockethost.io/api/admins/auth-with-password" \
  -H "Content-Type: application/json" \
  -d '{"identity":"your@email.com","password":"yourpassword"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Restore
curl -X POST "https://your-instance.pockethost.io/api/backups/restore/backup-2026-03-04.zip" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Security Notes

- No secrets are committed to the repo (`.env` is gitignored, credentials only in GitHub Secrets)
- GitHub Actions masks secret values in logs — passwords never appear in output
- PocketBase collections use open rules — acceptable for a personal-use app on a non-advertised URL
- CORS restricts browser API calls to your Netlify domain + localhost only
- Backup zips in `backups/` contain your full DB — the repo is public, so **do not include personal data you wouldn't want public** (job applications are personal, be aware)
  - Alternative: add `backups/` to `.gitignore` and use PocketHost's built-in backup retention instead

---

## Self-Hosting for Contributors

Since this is an open source project, anyone can run their own instance:

```bash
git clone https://github.com/manjunathk833/job-tracker.git
cd job-tracker
npm install
cp .env.example .env   # edit VITE_PB_URL

# Option A: Use PocketHost (free, no credit card) — create instance at pockethost.io
# Option B: Run PocketBase locally
cd pocketbase && ./pocketbase serve &
node scripts/setup-pb.js admin@local.dev yourpassword

npm run dev:all   # localhost:5173
```
