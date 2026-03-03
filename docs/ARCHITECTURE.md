# Architecture Decisions

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React + Vite | Fast dev server, great DX |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Production-grade, copy-paste components, dark mode built-in |
| **State** | Zustand | Simpler than Redux, perfect for this scale |
| **Backend/DB** | PocketBase v0.22.20 (single binary) | Open-source, self-hosted, REST API, zero config, SQLite |
| **Charts** | Recharts | React-native, declarative, lightweight |
| **Job Alerts** | Node.js cron + RSS feeds | Free, no API key needed |
| **Hosting** | Localhost (primary) → Netlify (optional) | Personal use |
| **Version Control** | GitHub + GitHub Actions | Automated CI + daily DB backup |

## Key Decisions

### PocketBase over Supabase/Sanity
- Single binary — `./pocketbase serve` — zero config
- Built-in admin UI at `localhost:8090/_/`
- No cloud account needed, SQLite underneath — fast, portable, zero cost
- REST + realtime subscriptions out of the box

### Tailwind CSS v4
- Installed via `@tailwindcss/vite` plugin (no PostCSS config)
- No `tailwind.config.js` — configuration in CSS via `@theme`
- Compatible with shadcn/ui v3

### shadcn/ui
- Component library built on Radix UI + Tailwind
- Copy-paste components live in `src/components/ui/`
- `components.json` at project root controls config

### Zustand over Redux
- No boilerplate, minimal API
- Stores in `src/store/` — one file per domain

## Folder Map

```
src/
  components/
    ui/          ← shadcn components (auto-generated, do not edit manually)
    layout/      ← Sidebar, TopBar, Layout
    applications/
    interviews/
    insights/
    alerts/
  pages/         ← One file per route
  store/         ← Zustand stores
  services/      ← All PocketBase API calls
  utils/         ← Constants, formatters, insight rules
  lib/           ← shadcn utils (utils.js)
```

## Port Map
- Frontend: http://localhost:5173
- PocketBase API: http://localhost:8090
- PocketBase Admin UI: http://localhost:8090/_/

## Environment Variables
- `VITE_PB_URL` — PocketBase base URL (default: http://localhost:8090)
