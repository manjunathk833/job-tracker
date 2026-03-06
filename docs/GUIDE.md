# User Guide — Job Tracker

A personal job application tracker for MAANG SDET roles. Tracks every stage of your job hunt: applications, interviews, insights, and automated job alerts.

---

## Quick Start

```bash
npm run dev:all
```

- Frontend: http://localhost:5173
- PocketBase admin: http://localhost:8090/_/

If this is your first time, complete the [one-time setup](#first-time-setup) first.

---

## First-Time Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start PocketBase and create an admin account

```bash
cd pocketbase && ./pocketbase serve
```

Open http://localhost:8090/_/ in your browser and create an admin account (any email + password you'll remember).

### 3. Create your `.env` file

```bash
cp .env.example .env
```

The default `.env.example` already has `VITE_PB_URL=http://localhost:8090` — no changes needed unless you change the port.

**Optional:** Add Adzuna API keys to get India-specific job listings:

```
ADZUNA_APP_ID=your-app-id
ADZUNA_APP_KEY=your-app-key
```

Register free at https://developer.adzuna.com (no credit card).

### 4. Run the setup script

```bash
node scripts/setup-pb.js admin@local.dev yourpassword
```

Replace `admin@local.dev` and `yourpassword` with the credentials you created in step 2.

This creates all 5 PocketBase collections and seeds 5 sample applications so the app isn't empty on first load.

**Optional:** Seed 11 SDET/QA job alerts:

```bash
node scripts/seed-alerts.js admin@local.dev yourpassword
```

### 5. Start the full app

```bash
npm run dev:all
```

Open http://localhost:5173.

---

## Pages

### Dashboard (Home)

The home page at `/`. Shows your job hunt at a glance:

- **Stat cards** — total applications, response rate, offers, active pipelines
- **Weekly trend** — area chart of applications per week for the last 8 weeks
- **Insights panel** — rule-based tips (e.g. "You haven't applied in 5 days", "Your response rate is above average")
- **Recent activity** — last 5 applications, sorted by date added

### Applications `/applications`

The main tracker. Every job you've applied to lives here.

**Adding an application:**
- Click **New Application** or press `N` anywhere on this page
- Fill in: Company, Role, Status, Applied Date, Source, Location, Salary Range, Resume Version, JD URL, Notes
- Click Save

**Editing / viewing details:**
- Click any row to open the detail drawer (slides in from the right)
- The drawer shows full application details + all interview rounds linked to this application
- Click **Edit** in the drawer to modify

**Deleting:**
- Open the detail drawer → click **Delete** → confirm

**Filtering:**
- Use the filter bar above the table to filter by Status, Source, or date range
- Filters combine (AND logic)

**Exporting:**
- Click **Export CSV** to download all applications as a CSV file
- The export respects the current filters — what you see is what you get

**Application statuses:**

| Status | Meaning |
|--------|---------|
| Applied | Submitted, waiting for response |
| Screening | Recruiter reached out / initial call scheduled |
| Interview | Active interview rounds underway |
| Offer | Received an offer |
| Rejected | Application closed |
| Withdrawn | You withdrew your application |

### Interviews `/interviews`

All interview rounds across all companies. Each round is linked to an application.

**Adding an interview:**
- Click **New Interview** or open an application drawer and click **Add Round**
- Fill in: Application (select from dropdown), Round type, Date, Location (Virtual/Onsite/Phone), Duration, Status, Notes, Questions asked

**Question bank:**
- Each interview form has an expandable question bank with common SDET interview questions grouped by category (DSA, System Design, Testing, Behavioral, etc.)
- Click any question to copy it into the "Questions Asked" field

**Filtering:**
- Filter by round type (Technical, System Design, HR, etc.) or status (Scheduled, Completed, etc.)

### Companies `/companies`

A grouped view of all companies you've interacted with.

- Each company card shows all applications + interview rounds for that company
- Click a company to expand and see the full history
- Useful for tracking your relationship with a company over multiple application cycles

### Insights `/insights`

Deep analytics on your job hunt performance:

- **Stat cards** — same as Dashboard
- **Funnel chart** — shows drop-off at each pipeline stage (Applied → Screening → Interview → Offer)
- **Source breakdown** — horizontal bar chart showing which job boards/sources drive the most applications
- **Recommendations** — color-coded tips based on your data patterns

### Alerts `/alerts`

Automated job listings fetched from Remotive, Himalayas, and Adzuna (India).

**Alert configuration:**
- Click **Configure Alerts** to add/edit alert rules
- Each alert has: keywords (e.g. "SDET"), location, source (Remotive/Himalayas/Adzuna), frequency
- Active alerts are fetched daily by the cron job

**Job listings feed:**
- New listings appear as cards with title, company, location, salary (if available), and source
- Click **View Job** to open the listing in a new tab
- Click **Apply** to add it directly to your Applications tracker (pre-fills company and role)

**Manually trigger a fetch:**

```bash
node scripts/job-alert-cron.js admin@local.dev yourpassword
```

---

## Keyboard Shortcuts

| Shortcut | Action | Where |
|----------|--------|-------|
| `N` | Open new application form | Applications page |
| `Cmd+K` / `Ctrl+K` | Open global search | Anywhere |
| `Esc` | Close any open modal/drawer | Anywhere |

### Global search (Cmd+K)

- Search by company name, role, or status across all applications
- Also shows page navigation shortcuts (e.g. type "interviews" to jump to the Interviews page)
- Arrow keys to navigate results, `Enter` to select, `Esc` to close

---

## Dark Mode

Toggle via the Sun/Moon icon in the top-right corner. Your preference is saved to `localStorage` and persists across sessions.

---

## Job Alert Cron

The cron script fetches new job listings based on your configured alerts and saves them to PocketBase.

**Manual run:**

```bash
node scripts/job-alert-cron.js admin@local.dev yourpassword
```

**Automated (local crontab):**

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 8:30 AM IST = 3:00 AM UTC)
0 3 * * * /opt/homebrew/bin/node /Users/yeshwinmanjunath/development/job-tracker/scripts/job-alert-cron.js admin@local.dev yourpassword >> /tmp/job-alert-cron.log 2>&1

# Check logs
tail -f /tmp/job-alert-cron.log
```

**Sources:**
- **Remotive** — Remote tech jobs worldwide. No API key needed.
- **Himalayas** — Remote + India-filtered jobs. No API key needed.
- **Adzuna** — Best India-specific results. Free API key at https://developer.adzuna.com. Add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` to `.env`.

---

## Scripts Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-pb.js` | Create all PocketBase collections + seed 5 sample apps | `node scripts/setup-pb.js <email> <password>` |
| `seed-alerts.js` | Seed 11 SDET/QA alert configs | `node scripts/seed-alerts.js <email> <password>` |
| `job-alert-cron.js` | Fetch new job listings from all alert sources | `node scripts/job-alert-cron.js <email> <password>` |

All scripts use `VITE_PB_URL` from `.env` (defaults to `http://localhost:8090`).

---

## Data Management

### Backup

PocketBase stores everything in a single SQLite file: `pocketbase/pb_data/data.db`.

```bash
# Simple backup — copy the file
cp pocketbase/pb_data/data.db ~/Desktop/job-tracker-backup-$(date +%Y-%m-%d).db
```

### Restore

```bash
# Stop PocketBase first, then replace the file
cp ~/Desktop/job-tracker-backup-2026-03-04.db pocketbase/pb_data/data.db
npm run dev:all
```

### Reset (start fresh)

```bash
# Delete the database and re-run setup
rm pocketbase/pb_data/data.db
cd pocketbase && ./pocketbase serve &
node scripts/setup-pb.js admin@local.dev yourpassword
```

---

## PocketBase Admin Panel

Direct database access at http://localhost:8090/_/.

Useful for:
- Viewing/editing raw records
- Checking collection schemas
- Importing/exporting data
- Viewing API logs

---

## Common Issues

**"Failed to authenticate" when running a script**
→ Make sure PocketBase is running (`npm run dev:all` or `cd pocketbase && ./pocketbase serve`) and the email/password match your admin account at http://localhost:8090/_/.

**App loads but no data appears**
→ Run the setup script: `node scripts/setup-pb.js admin@local.dev yourpassword`

**PocketBase binary not found**
→ Re-download for your platform:
```bash
# macOS ARM64 (M1/M2/M3)
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.20/pocketbase_0.22.20_darwin_arm64.zip -o /tmp/pb.zip
unzip /tmp/pb.zip -d pocketbase
chmod +x pocketbase/pocketbase
```

**Port already in use**
→ Check what's on the port: `lsof -i :8090` or `lsof -i :5173`, then kill it: `kill -9 <PID>`
