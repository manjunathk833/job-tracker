# 🚀 Job Application Tracker — Claude Code Master Plan
> **Author:** Manjunath H K | Senior SDET → MAANG Transition
> **Est. Time:** 3–5 hours of continuous Claude Code interaction
> **Last Updated:** 2026-03-03

---

## 📋 TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Tech Stack Decision](#2-tech-stack-decision)
3. [Folder Structure](#3-folder-structure)
4. [CLAUDE.md Setup — With Auto-Update Strategy](#4-claudemd-setup)
5. [GitHub Integration Plan](#5-github-integration-plan)
6. [Feature Sprints (Agile)](#6-feature-sprints-agile)
7. [Master Prompt for Claude Code](#7-master-prompt-for-claude-code)
8. [Token Optimization Strategies](#8-token-optimization-strategies)
9. [Stop Conditions and Verification Checkpoints](#9-stop-conditions)

---

## 1. PROJECT OVERVIEW

Build a **personal job application tracker** optimized for MAANG-level SDET job hunting.

### Core Goals
- Fast-track applications using pre-filled templates and auto-fill helpers
- Track applications, interviews, outcomes, and interview Q&A per company
- Insights — performance trends, weak areas, success rates
- Job Alerts — monitor job boards via RSS feeds for SDET roles

### Who Uses This
Solo use (localhost primary). Can be deployed to Netlify later for mobile access.

---

## 2. TECH STACK DECISION

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React + Vite | Fast dev server, great DX |
| **Styling** | Tailwind CSS + shadcn/ui | Production-grade, copy-paste components, dark mode built-in |
| **State** | Zustand | Simpler than Redux, perfect for this scale |
| **Backend/DB** | PocketBase (single binary) | Open-source, self-hosted, REST API, zero config, SQLite |
| **Charts** | Recharts | React-native, declarative, lightweight |
| **Job Alerts** | Node.js cron + RSS feeds | Free, no API key needed |
| **Hosting** | Localhost (primary) → Netlify (optional) | Personal use = no deployment needed |
| **Version Control** | GitHub + GitHub Actions | Automated CI + daily DB backup |

### Why PocketBase over Supabase/Sanity
- Single binary — `./pocketbase serve` — zero config
- Built-in admin UI at `localhost:8090/_/`
- No cloud account needed, SQLite underneath — fast, portable, zero cost
- REST + realtime subscriptions out of the box

---

## 3. FOLDER STRUCTURE
```
job-tracker/
├── CLAUDE.md                        # Claude Code reads this automatically every session
├── docs/
│   ├── SCHEMA.md                    # PocketBase schema (referenced from CLAUDE.md)
│   ├── PLAN.md                      # This file — copy here
│   └── ARCHITECTURE.md              # Tech decisions and folder layout
├── README.md
├── .env.example
├── .gitignore
├── package.json
│
├── pocketbase/
│   ├── pocketbase                   # Binary (macOS ARM64)
│   └── pb_data/                     # Auto-generated DB (backed up to GitHub daily)
│
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   └── Layout.jsx
│   │   ├── applications/
│   │   │   ├── ApplicationCard.jsx
│   │   │   ├── ApplicationForm.jsx
│   │   │   ├── ApplicationTable.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── interviews/
│   │   │   ├── InterviewCard.jsx
│   │   │   ├── InterviewForm.jsx
│   │   │   └── QuestionBank.jsx
│   │   ├── insights/
│   │   │   ├── StatsOverview.jsx
│   │   │   ├── FunnelChart.jsx
│   │   │   └── WeeklyProgress.jsx
│   │   └── alerts/
│   │       ├── AlertConfig.jsx
│   │       └── JobAlertFeed.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Applications.jsx
│   │   ├── Interviews.jsx
│   │   ├── Companies.jsx
│   │   ├── Insights.jsx
│   │   └── Alerts.jsx
│   ├── store/
│   │   ├── applicationStore.js
│   │   ├── interviewStore.js
│   │   └── alertStore.js
│   ├── services/
│   │   ├── pb.js
│   │   ├── applicationService.js
│   │   ├── interviewService.js
│   │   └── alertService.js
│   └── utils/
│       ├── constants.js
│       ├── formatters.js
│       └── insights.js
│
├── scripts/
│   └── job-alert-cron.js
│
└── .github/
    └── workflows/
        ├── ci.yml
        ├── backup.yml
        └── release.yml
```

---

## 4. CLAUDE.md SETUP

### How Auto-Updates Work

Claude Code **automatically reads `CLAUDE.md`** at session start. To keep it always current, end every session with:
```
Update CLAUDE.md:
- Mark Sprint [N] done with today's date under SPRINT STATUS
- Append any new decisions under DECISIONS LOG
- Update CURRENT STATE with what's built and what's next
- Update KNOWN ISSUES with any bugs or TODOs
Do NOT delete existing content — only update or append.
Commit: "docs: update CLAUDE.md sprint-N progress"
```

Claude edits section-by-section using the labeled headers as anchors — `CURRENT STATE` is updated without touching `CODE STANDARDS`.

### Split Context Strategy (keeps CLAUDE.md lean)
```
CLAUDE.md            → current state, sprint status, decisions (updated every session)
docs/SCHEMA.md       → full PocketBase schema (stable)
docs/ARCHITECTURE.md → tech decisions (stable)
docs/PLAN.md         → this file — sprint task lists (reference only)
```

Claude Code follows `See docs/SCHEMA.md` references automatically — no need to paste schema into every session.

---

### CLAUDE.md Starting Template

Create this at the project root before Sprint 0. Claude maintains it after each session.
```markdown
# CLAUDE.md

## ⚡ CURRENT STATE
**Last Updated:** 2026-03-03
**Active Sprint:** Sprint 0
**Last Completed:** None yet
**Next Action:** Run Sprint 0 bootstrap tasks

---

## ✅ SPRINT STATUS
- [ ] Sprint 0 — Bootstrap
- [ ] Sprint 1 — Application CRUD
- [ ] Sprint 2 — Interview Tracker
- [ ] Sprint 3 — Dashboard + Insights
- [ ] Sprint 4 — Job Alerts
- [ ] Sprint 5 — Polish + Export

---

## 📋 DECISIONS LOG
- 2026-03-03: Chose PocketBase over Supabase — zero config, single binary, localhost-first

---

## 🐛 KNOWN ISSUES
- None currently

---

## 🏗 PROJECT CONTEXT
Personal job application tracker for Manjunath H K (Senior SDET targeting MAANG).
Solo-use app — localhost only. No authentication required.
See docs/PLAN.md for sprint task lists and verification steps.
See docs/SCHEMA.md for PocketBase collection schemas.

---

## 🛠 TECH STACK
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- Backend: PocketBase (localhost:8090)
- State: Zustand | Charts: Recharts
- See docs/ARCHITECTURE.md for full rationale

---

## 🔧 CODE STANDARDS
- Functional components with hooks only — no class components
- All PocketBase calls go through /src/services/ only
- Zustand for shared state, useState for component-only state
- Tailwind only — no inline styles, no CSS modules
- shadcn/ui components before building custom ones
- Always wrap async in try/catch — show toast on error
- Never hardcode URLs — use VITE_PB_URL from .env

---

## ▶ COMMANDS
- Start both: npm run dev:all
- Frontend: npm run dev (port 5173)
- Backend: cd pocketbase && ./pocketbase serve (port 8090)
- Push: git add . && git commit -m "feat: x" && git push origin dev

---

## ❌ DO NOT
- No authentication
- No class components
- No separate CSS files
- No hardcoded credentials
- Do not start next sprint until user types 'ok'
```

---

## 5. GITHUB INTEGRATION PLAN

### Pre-Requisite — One-Time Manual Step
```bash
brew install gh
gh auth login
# Select: GitHub.com → HTTPS → Login with browser
```

That is the only manual step. Everything after this is Claude Code.

---

### GitHub Setup Prompt (run at end of Sprint 0)
```
GitHub CLI is authenticated. Set up full GitHub integration:

1. Create private GitHub repo 'job-tracker':
   gh repo create job-tracker --private --source=. --remote=origin --push

2. Create .gitignore for Vite + React + PocketBase:
   Ignore: node_modules/, dist/, .env, pocketbase/pb_data/logs/, pocketbase/pb_data/storage/

3. Branch structure:
   - Push initial state to main
   - Create dev branch: git checkout -b dev && git push -u origin dev
   - Dev is the default working branch for all sprints

4. Create .github/workflows/ci.yml:
   - Trigger: push to dev + PRs to main
   - Steps: checkout → Node 20 → npm ci → npm run build

5. Create .github/workflows/backup.yml:
   - Trigger: cron '30 14 * * *' (8PM IST) + workflow_dispatch
   - Steps: checkout with write permissions → git add pocketbase/pb_data/ → commit if changes → push
   - Use GITHUB_TOKEN

6. Create .github/workflows/release.yml:
   - Trigger: push to main
   - Steps: create tag vYYYY.MM.DD → push tag → gh release create with auto notes

7. Commit all workflow files to dev and push
8. Print the GitHub repo URL

My GitHub username is [YOUR_GITHUB_USERNAME].
```

---

### Per-Sprint Git Workflow
```bash
# All sprint work stays on dev (Claude Code handles commits automatically)
git checkout dev
# ... Claude builds and commits ...
git push origin dev

# Sprint verified — merge to main via PR
gh pr create --base main --head dev --title "Sprint N: [name]" --body "Verified ✓"
gh pr merge --squash
# main gets one clean commit per sprint + auto-release tag
```

### Commit Convention
```
feat: add interview question bank
fix: application status not persisting after refresh
chore: db backup 2026-03-03
docs: update CLAUDE.md sprint-2 progress
```

---

### GitHub Actions — Full YAML

**`ci.yml`**
```yaml
name: CI
on:
  push:
    branches: [dev]
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
```

**`backup.yml`**
```yaml
name: DB Backup
on:
  schedule:
    - cron: '30 14 * * *'
  workflow_dispatch:
jobs:
  backup:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - name: Backup DB
        run: |
          git config user.email "manjunathhk833@gmail.com"
          git config user.name "Auto Backup Bot"
          git add pocketbase/pb_data/ || true
          git diff --cached --quiet || git commit -m "chore: db backup $(date +%Y-%m-%d)"
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**`release.yml`**
```yaml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - name: Create release
        run: |
          TAG="v$(date +%Y.%m.%d)"
          git tag $TAG
          git push origin $TAG
          gh release create $TAG --title "Release $TAG" --generate-notes
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 6. FEATURE SPRINTS (AGILE)

### Sprint 0 — Bootstrap (30 min)
**Goal:** Running app skeleton + GitHub wired up

- Create Vite + React project `job-tracker`
- Install: tailwindcss, shadcn/ui, zustand, recharts, react-router-dom, pocketbase, concurrently
- Download PocketBase binary for macOS ARM64 into `/pocketbase`
- Create CLAUDE.md using template from Section 4
- Create docs/ with SCHEMA.md, ARCHITECTURE.md, PLAN.md
- Build Sidebar Layout + 6 empty page shells
- Add `dev:all` concurrently script to package.json
- Run GitHub setup prompt from Section 5 (auth already done)
- Update CLAUDE.md, commit to dev

**✅ Verify:** localhost:5173 loads + sidebar navigation works + PocketBase admin at :8090/_/ + GitHub repo + CI visible in Actions

---

### Sprint 1 — Application Tracking Core (60 min)
**Goal:** Full CRUD for job applications

- Create `applications` collection in PocketBase admin
- ApplicationForm modal (add + edit, all fields from docs/SCHEMA.md)
- ApplicationTable with sorting + filters (status, source, date range)
- Color-coded StatusBadge component
- Application detail side drawer
- Quick-add from JD URL (auto-parse company from domain)
- Add 5 sample applications

**✅ Verify:** Add / edit / delete / filter all work; data persists after refresh

---

### Sprint 2 — Interview Tracker (45 min)
**Goal:** Interview rounds per application + question bank

- Create `interviews` collection in PocketBase
- Interview form linked to application via relation
- Interview rounds timeline in application detail
- Question bank (Q + answer + Easy/Medium/Hard difficulty)
- Company-level consolidated interview history page

**✅ Verify:** Can add rounds and questions; appear under correct application; company history works

---

### Sprint 3 — Dashboard + Insights (45 min)
**Goal:** Visual overview and rule-based suggestions

- Stats cards: Applied, Active Pipeline, Offers, Rejection Rate
- Funnel chart: Applied → Screening → Interview → Offer
- Weekly trend line chart (last 8 weeks)
- Source breakdown (LinkedIn vs Naukri vs Direct vs Referral)
- Rule-based insight panel:
```javascript
responseRate < 20    → "ATS may be filtering resume — check keyword match"
ghostedCount > 5     → "Follow up on applications older than 7 days"
technicalRejects > 3 → "High technical rejection — prioritize DSA practice"
linkedinShare > 80   → "Over-indexed on LinkedIn — diversify to Naukri and direct"
noActivityLast7Days  → "Pace is slow — target 3 new applications today"
```

**✅ Verify:** Stats match actual DB data; charts render; at least 1 insight shows

---

### Sprint 4 — Job Alerts (30 min)
**Goal:** Surface new SDET job listings from RSS automatically

- Create `alerts` collection in PocketBase
- Alert config UI (keyword + source selection)
- RSS feed parser in scripts/job-alert-cron.js
- Job feed on Alerts page (title, company, date, link)
- Save job from feed → auto-creates application with source = "alert"

**Free RSS:**
```
Indeed IN: https://in.indeed.com/rss?q=Senior+SDET&l=Bengaluru
```

**✅ Verify:** Job listings load for "Senior SDET"; saved jobs appear in Applications

---

### Sprint 5 — Polish + Export (30 min)
**Goal:** Production-ready personal tool

- Dark mode toggle (shadcn theme, persisted)
- Export to CSV
- Global search Cmd+K
- Keyboard shortcut N = new application
- Mobile responsive check (375px)
- README 5-step setup guide
- All sprints merged to main via PRs; final GitHub Release created

**✅ Verify:** Dark mode persists; CSV exports correctly; search + shortcuts work; mobile layout OK

---

## 7. MASTER PROMPT FOR CLAUDE CODE

Copy this as your **very first message** when opening Claude Code in the project folder:
```
I want to build a personal job application tracker web app.

Read this plan file completely before doing anything: docs/PLAN.md
(If it doesn't exist yet, create the docs/ folder and I'll tell you to proceed.)

My setup:
- MacBook Air M4 (Apple Silicon / ARM64)
- Node.js and npm installed, Claude Code running
- GitHub CLI installed and authenticated (gh auth login already done)
- Java/Python expert — intermediate JavaScript

WORKFLOW RULES:
1. Read CLAUDE.md at session start — it is the live source of truth
2. One Sprint per session, in order: 0 → 1 → 2 → 3 → 4 → 5
3. After each Sprint:
   a. Update CLAUDE.md (mark done, update state, log decisions)
   b. Commit to dev: "feat: sprint-N complete" and push
   c. STOP — list exact verification steps — wait for me to type 'ok'
4. Log any unplanned decisions in CLAUDE.md DECISIONS LOG

BEGIN Sprint 0 now.
After Sprint 0 tasks are done, also run the GitHub setup from Section 5
(gh auth is already done — skip that step).
```

### Session Resume Template
```
Read CLAUDE.md. Sprint [N-1] is done and committed to dev.
Continue with Sprint [N] — task list is in docs/PLAN.md.
```

---

## 8. TOKEN OPTIMIZATION STRATEGIES

**1. CLAUDE.md as Memory** — Claude reads it automatically. Never re-explain stack or schema.
Pattern: `"Read CLAUDE.md. Continue Sprint N."`

**2. Split Context Files** — CLAUDE.md stays lean, references docs/SCHEMA.md and docs/PLAN.md.
Claude follows references automatically.

**3. Reference Schema, Never Paste**
```
# Wasteful: "Build form with fields: company text, role text, status select applied/screening/..."
# Efficient: "Build ApplicationForm — use 'applications' schema from docs/SCHEMA.md"
```

**4. Batch Requests**
```
# 3 round trips: "Add company field" → wait → "Add role" → wait → ...
# 1 message: "Build complete ApplicationForm with all fields from docs/SCHEMA.md using shadcn Dialog"
```

**5. Scope File Edits**
```
# Avoid: "Rewrite ApplicationTable to add filtering"
# Use: "In ApplicationTable.jsx, add filter bar above table. Don't change table rendering."
```

**6. /clear Between Sprints** — Clears accumulated token cost from prior sprint context.
Start fresh: `"Read CLAUDE.md. Continue Sprint N+1."`

**7. End-of-Session One-Liner**
```
"Update CLAUDE.md with today's progress. Commit to dev as 'feat: sprint-N'. Push origin."
```

---

## 9. STOP CONDITIONS AND VERIFICATION CHECKPOINTS

**Sprint 0 ✅** localhost:5173 + sidebar works / PocketBase admin at :8090 / `dev:all` starts both / GitHub repo + CI visible / CLAUDE.md committed

**Sprint 1 ✅** Add/edit/delete/filter all work / data persists after refresh / 5+ applications exist

**Sprint 2 ✅** Interview rounds linked to applications / questions with difficulty saved / company history page works

**Sprint 3 ✅** Stat cards match DB counts / funnel + trend charts render / at least 1 insight shows

**Sprint 4 ✅** Job listings load for "Senior SDET" / saving a job creates application / new keyword triggers refresh

**Sprint 5 ✅** Dark mode persists / CSV exports / Cmd+K search works / N shortcut works / mobile layout OK / PRs merged + GitHub Release created

### 🏁 FINAL STOP
All 5 sprints verified. App runs with `npm run dev:all`. All work merged to main. CLAUDE.md complete. README has 5-step setup.

---

## QUICK REFERENCE
```bash
npm run dev:all                          # Start the app
"Read CLAUDE.md. Continue Sprint [N]."  # New session
"Update CLAUDE.md, commit, push."       # End of session
gh pr create --base main --head dev     # Sprint done → PR
gh pr merge --squash                    # Merge to main
```

## Design Reference

| Element | Value |
|---------|-------|
| Sidebar | `#1a1a2e` |
| Accent | `#6366f1` indigo |
| Applied | Blue | Screening | Yellow |
| Interview | Purple | Offer | Green |
| Rejected | Red | Ghosted | Gray |
| Font | Inter |
| Inspiration | Linear.app + Notion |

---

## docs/SCHEMA.md (create this in your docs/ folder)
```markdown
# PocketBase Collections Schema

## applications
| Field | Type | Options |
|-------|------|---------|
| company | text (required) | |
| role | text (required) | |
| status | select | applied, screening, interview, offer, rejected, ghosted |
| applied_date | date | |
| source | text | linkedin, naukri, direct, referral, alert |
| jd_url | url | |
| resume_version | text | e.g. v3-sdet-maang |
| notes | text | |
| salary_range | text | e.g. 30-40 LPA |
| location | text | e.g. Bengaluru / Remote |

## interviews
| Field | Type | Options |
|-------|------|---------|
| application | relation → applications | |
| round | text | HR, Technical-1, Technical-2, System-Design, Final |
| scheduled_date | date | |
| status | select | scheduled, completed, cancelled |
| feedback | text | |
| questions | json | [{question, answer, difficulty: Easy/Medium/Hard}] |
| interviewer_name | text | |

## companies
| Field | Type | Options |
|-------|------|---------|
| name | text (required) | |
| tier | select | MAANG, Tier-1, Tier-2, Startup |
| website | url | |
| glassdoor_url | url | |
| notes | text | |
| tags | json | string[] |

## alerts
| Field | Type | Options |
|-------|------|---------|
| keyword | text | e.g. Senior SDET |
| source | text | linkedin, naukri, indeed |
| last_checked | date | |
| active | bool | |
```

---
*Single source of truth. Claude Code reads CLAUDE.md automatically.*
*Start every session: `"Read CLAUDE.md. Continue Sprint [N]."`*
*End every session: `"Update CLAUDE.md. Commit to dev. Push."`*