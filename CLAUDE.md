# CLAUDE.md

## ⚡ CURRENT STATE
**Last Updated:** 2026-03-04
**Active Sprint:** Sprint 5
**Last Completed:** Sprint 4 — 2026-03-04
**Next Action:** Run Sprint 5 — Polish + Export

---

## ✅ SPRINT STATUS
- [x] Sprint 0 — Bootstrap ✅ 2026-03-03
- [x] Sprint 1 — Application CRUD ✅ 2026-03-03
- [x] Sprint 2 — Interview Tracker ✅ 2026-03-04
- [x] Sprint 3 — Dashboard + Insights ✅ 2026-03-04
- [x] Sprint 4 — Job Alerts ✅ 2026-03-04
- [ ] Sprint 5 — Polish + Export

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
- 2026-03-04: Sprint 4 — alerts + job_listings PocketBase collections, alertService, alertStore, AlertConfig, JobAlertFeed, Alerts page, job-alert-cron.js (Indeed RSS → PocketBase), Save listing → auto-create application

---

## 🐛 KNOWN ISSUES
- None currently

---

## 🏗 PROJECT CONTEXT
Personal job application tracker for Manjunath H K (Senior SDET targeting MAANG).
Solo-use app — localhost only. No authentication required.
See docs/PLAN.md for sprint task lists and verification steps.
See docs/SCHEMA.md for PocketBase collection schemas.
GitHub: https://github.com/manjunathk833/job-tracker (private)

---

## 🛠 TECH STACK
- Frontend: React 19 + Vite 7 + Tailwind CSS v4 + shadcn/ui v3
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