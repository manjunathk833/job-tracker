# Job Tracker — MAANG SDET Hunt

Personal job application tracker for Senior SDET roles. Tracks applications, interviews, insights, and job alerts in one local-first app.

---

## 5-Step Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Download PocketBase binary

Already bundled at `pocketbase/pocketbase` (macOS ARM64). If you need to re-download:

```bash
mkdir -p pocketbase
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.20/pocketbase_0.22.20_darwin_arm64.zip -o /tmp/pb.zip
unzip /tmp/pb.zip -d pocketbase
```

### 3. Create your `.env` file

```bash
cp .env.example .env
# Edit .env — set VITE_PB_URL (default: http://localhost:8090)
# Optional: add ADZUNA_APP_ID and ADZUNA_APP_KEY for India job listings
#   → Register free at https://developer.adzuna.com
```

### 4. Set up PocketBase

Start PocketBase, create an admin account at http://localhost:8090/_/, then run the setup script:

```bash
cd pocketbase && ./pocketbase serve &
node scripts/setup-pb.js admin@local.dev yourpassword
```

This creates all collections and seeds sample data.

**Optional:** Seed comprehensive SDET/QA alerts (Remotive, Himalayas, Adzuna):

```bash
node scripts/seed-alerts.js admin@local.dev yourpassword
```

### 5. Start the app

```bash
npm run dev:all
```

Open http://localhost:5173

---

## Features

| Feature | Details |
|---------|---------|
| **Applications** | Full CRUD — add, edit, delete, filter by status/source |
| **Interviews** | Rounds per application, question bank with difficulty |
| **Companies** | Grouped view of all companies with interview history |
| **Dashboard** | Stat cards, weekly trend chart, rule-based insights |
| **Insights** | Funnel chart, source breakdown, recommendations |
| **Job Alerts** | Auto-fetch listings from Remotive, Himalayas, Adzuna |
| **Dark mode** | Toggle in top-right, persists across sessions |
| **Export CSV** | Download all applications as CSV |
| **Search** | `Cmd+K` global search across apps and pages |
| **Shortcuts** | Press `N` on Applications page to open new form |

---

## Job Alert Cron

Run manually or schedule daily at 8:30 PM IST (3:00 AM UTC):

```bash
# Manual run
node scripts/job-alert-cron.js admin@local.dev yourpassword

# Crontab (add via `crontab -e`)
0 3 * * * /opt/homebrew/bin/node /path/to/job-tracker/scripts/job-alert-cron.js admin@local.dev yourpassword >> /tmp/job-alert-cron.log 2>&1
```

Check logs: `tail -f /tmp/job-alert-cron.log`

---

## Tech Stack

- **Frontend:** React 19 + Vite 7 + Tailwind CSS v4 + shadcn/ui v3
- **Backend:** PocketBase v0.22.20 (SQLite, zero config)
- **State:** Zustand v5 | **Charts:** Recharts v3
