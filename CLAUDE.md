# CLAUDE.md

## ⚡ CURRENT STATE
**Last Updated:** 2026-03-04
**Active Sprint:** Complete
**Last Completed:** Sprint 6 — Hosting pipeline — 2026-03-04
**Next Action:** Run deployment steps in docs/HOSTING.md

---

## ✅ SPRINT STATUS
- [x] Sprint 0 — Bootstrap ✅ 2026-03-03
- [x] Sprint 1 — Application CRUD ✅ 2026-03-03
- [x] Sprint 2 — Interview Tracker ✅ 2026-03-04
- [x] Sprint 3 — Dashboard + Insights ✅ 2026-03-04
- [x] Sprint 4 — Job Alerts ✅ 2026-03-04
- [x] Sprint 5 — Polish + Export ✅ 2026-03-04

---

## 📋 DECISIONS LOG
- 2026-03-03: Chose PocketBase over Supabase — zero config, single binary, localhost-first
- 2026-03-03: Using Tailwind CSS v4 (installed as @tailwindcss/vite plugin, no tailwind.config.js)
- 2026-03-03: shadcn/ui v3 initialized with default theme (neutral), components in src/components/ui/
- 2026-03-03: jsconfig.json added for path alias @/* → src/* (JavaScript project, not TypeScript)
- 2026-03-03: PocketBase v0.22.20 ARM64 binary confirmed, Node v24.8.0
- 2026-03-03: Sprint 1 — applicationService, applicationStore (Zustand), ApplicationForm (Dialog), ApplicationTable (sort+filter), ApplicationDrawer (Sheet), StatusBadge
- 2026-03-03: scripts/setup-pb.js creates all PocketBase collections + seeds 5 sample apps
- 2026-03-04: Sprint 2 — interviewService, interviewStore, InterviewForm (Dialog + question bank), InterviewCard, QuestionBank, updated ApplicationDrawer (interview timeline), Interviews page (filters), Companies page (grouped)
- 2026-03-04: Sprint 3 — insights.js utility (computeStats, computeFunnelData, computeWeeklyData, computeSourceBreakdown, generateInsights), StatsOverview, FunnelChart, WeeklyProgress components, full Dashboard + Insights pages
- 2026-03-04: Sprint 4 — alerts + job_listings PocketBase collections, alertService, alertStore, AlertConfig, JobAlertFeed, Alerts page, job-alert-cron.js, seed-alerts.js
- 2026-03-04: Job alert sources — in.indeed.com/rss is defunct (404). Using Remotive API (no key), Himalayas API (no key, India filter), Adzuna API (free key at developer.adzuna.com, best India results)
- 2026-03-04: Adzuna API keys stored in .env (ADZUNA_APP_ID, ADZUNA_APP_KEY). job-alert-cron.js auto-loads .env via readFileSync since Vite doesn't load .env for Node scripts
- 2026-03-04: 11 active alerts seeded via seed-alerts.js — SDET/Senior SDET/Staff SDET/QA Automation/Test Automation across all 3 sources
- 2026-03-04: Crontab configured — daily 8:30 AM IST (3:00 AM UTC). Node path: /opt/homebrew/bin/node. Logs: /tmp/job-alert-cron.log
- 2026-03-04: Sprint 5 — Dark mode toggle (next-themes ThemeProvider, persisted to localStorage via storageKey="job-tracker-theme"), CSV export on Applications page, Cmd+K global search (CommandPalette in Layout), N shortcut to open new application form, mobile sidebar (Sheet from left), README updated with 5-step setup guide
- 2026-03-04: Sprint 6 — Hosting pipeline: Netlify (frontend, free) + PocketHost.io (PocketBase, free, no credit card) + GitHub Actions job-alert-cron.yml (replaces local crontab) + backup.yml rewritten to use PocketBase /api/backups endpoint. Repo made public → unlimited Actions minutes. netlify.toml added. docs/HOSTING.md is the deployment guide.

---

## 🐛 KNOWN ISSUES
- None currently

---

## 🏗 PROJECT CONTEXT
Personal job application tracker for Manjunath H K (Senior SDET targeting MAANG).
Open source — public GitHub repo. No authentication required.
See docs/PLAN.md for sprint task lists and enhancement roadmap.
See docs/SCHEMA.md for PocketBase collection schemas.
See docs/HOSTING.md for deployment guide (Netlify + PocketHost.io).
GitHub: https://github.com/manjunathk833/job-tracker (public)

---

## 🛠 TECH STACK
- Frontend: React 19 + Vite 7 + Tailwind CSS v4 + shadcn/ui v3
- Backend: PocketBase v0.22.20 ARM64 (localhost:8090)
- State: Zustand v5 | Charts: Recharts v3
- Router: React Router v7 | PocketBase SDK: v0.26.8
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
- useEffect with empty [] deps + per-field Zustand selectors to prevent re-fetch loops

---

## ▶ COMMANDS
- Start both: npm run dev:all
- Frontend: npm run dev (port 5173)
- Backend: cd pocketbase && ./pocketbase serve (port 8090)
- Setup PocketBase schema + seed: node scripts/setup-pb.js <email> <password>
- Seed all SDET alerts: node scripts/seed-alerts.js <email> <password>
- Fetch job listings (manual): node scripts/job-alert-cron.js <email> <password>
- Fetch job listings (auto): GitHub Actions job-alert-cron.yml runs daily 3:00 PM UTC (8:30 PM IST)
- Push: git add . && git commit -m "feat: x" && git push origin dev

---

## ❌ DO NOT
- No authentication
- No class components
- No separate CSS files
- No hardcoded credentials
- Do not start next sprint until user types 'ok'
