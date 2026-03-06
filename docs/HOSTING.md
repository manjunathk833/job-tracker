# HOSTING.md — Deployment Notes

## Current Setup

The app runs **locally** — PocketBase on `localhost:8090`, frontend on `localhost:5173`.

```
npm run dev:all
# Frontend: http://localhost:5173
# PocketBase admin: http://localhost:8090/_/
```

This is the primary and recommended way to run the app. PocketBase is a single binary with zero external dependencies — no database server, no Docker, no cloud account needed.

---

## Frontend on Netlify (optional)

If you want the UI accessible from other devices (phone, work laptop) while keeping PocketBase local, deploy only the frontend to Netlify. The frontend is a static SPA — free to host anywhere.

`netlify.toml` is already committed. Steps:

1. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git
2. Connect GitHub → select `manjunathk833/job-tracker`
3. Branch: `main` | Build command: `npm run build` | Publish dir: `dist`
4. Add env variable: `VITE_PB_URL` = your PocketBase URL (see options below)
5. Deploy

> **Note:** Netlify builds bake `VITE_PB_URL` into the JS bundle at build time. If you change the PocketBase URL later, trigger a new Netlify deploy.

---

## PocketBase Hosting Options

If you want PocketBase accessible publicly (for Netlify frontend + GitHub Actions cron/backup):

| Option | Cost | Notes |
|--------|------|-------|
| **Local only** | Free | Current setup. Works perfectly for personal use on one machine. |
| **Railway** | Free tier (500 hrs/mo) | Supports persistent volumes. Deploy via Docker. Requires credit card for verification only (not charged on free tier). |
| **Render** | Free tier | Free web service + persistent disk ($0.25/GB/mo). Docker deploy. |
| **VPS (Hetzner/DigitalOcean)** | ~€4-5/mo | Most reliable. Full control. Run PocketBase binary directly. |
| **Tailscale** | Free | VPN mesh — expose localhost:8090 to your own devices only. No public URL. |

### Quickest path to a public URL (no account needed): Cloudflare Quick Tunnel

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Start a temporary public tunnel to local PocketBase
cloudflared tunnel --url http://localhost:8090
```

This gives you a random `https://*.trycloudflare.com` URL — valid as long as the command runs. Useful for testing Netlify → local PocketBase calls. Not stable across restarts.

---

## GitHub Actions Workflows

Three workflows are committed:

| Workflow | Trigger | Requires |
|----------|---------|----------|
| `ci.yml` | Push to `dev`, PR to `main` | Nothing — builds with `VITE_PB_URL=localhost` |
| `job-alert-cron.yml` | Daily 3:00 PM UTC, manual | Live PocketBase URL + secrets |
| `backup.yml` | Daily 2:30 PM UTC, manual | Live PocketBase URL + secrets |

`ci.yml` runs automatically and always works. The cron and backup workflows need these GitHub Secrets set:

```bash
gh secret set VITE_PB_URL        # https://your-pocketbase-url
gh secret set PB_ADMIN_EMAIL
gh secret set PB_ADMIN_PASSWORD
gh secret set ADZUNA_APP_ID      # optional
gh secret set ADZUNA_APP_KEY     # optional
```

Until a live PocketBase URL is configured, the cron and backup jobs will fail silently on schedule (they only matter if you have remote PocketBase).

---

## Local Cron (current)

Job alerts are fetched daily via crontab (set up during Sprint 6):

```bash
# Check current crontab
crontab -l

# Entry (runs at 8:30 AM IST = 3:00 AM UTC)
0 3 * * * /opt/homebrew/bin/node /Users/yeshwinmanjunath/development/job-tracker/scripts/job-alert-cron.js admin@local.dev yourpassword >> /tmp/job-alert-cron.log 2>&1

# Check logs
tail -f /tmp/job-alert-cron.log
```

This works independently of GitHub Actions — no live URL required.
