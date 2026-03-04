/**
 * Job Alert Cron
 * Fetches jobs from multiple sources for active alerts and stores new listings in PocketBase.
 *
 * Usage:
 *   node scripts/job-alert-cron.js <admin-email> <admin-password>
 *
 * For Adzuna source — register free at https://developer.adzuna.com and set env vars:
 *   ADZUNA_APP_ID=xxx ADZUNA_APP_KEY=xxx node scripts/job-alert-cron.js ...
 *
 * Schedule (crontab — daily 8PM IST):
 *   30 14 * * * cd /path/to/job-tracker && node scripts/job-alert-cron.js admin@local.dev password123
 */

// Load .env file — Vite handles this for the browser but Node scripts need it explicitly
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
try {
  const envPath = resolve(__dirname, '../.env')
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !(key in process.env)) process.env[key] = val
  }
} catch (_) { /* .env not found — rely on shell env vars */ }

const PB_URL = process.env.VITE_PB_URL || 'http://localhost:8090'
const [, , email, password] = process.argv

if (!email || !password) {
  console.error('Usage: node scripts/job-alert-cron.js <admin-email> <admin-password>')
  process.exit(1)
}

// ── Source definitions ────────────────────────────────────────────────────────
// Each source: fetch(keyword) → raw data, parse(data) → [{title,company,link,description,published_date}]

const SOURCES = {
  // Remotive — free public JSON API, no auth. Remote QA/Dev jobs. No India filter (filter client-side).
  remotive: {
    label: 'Remotive (Remote)',
    async fetch(keyword) {
      const url = `https://remotive.com/api/remote-jobs?category=qa&search=${encodeURIComponent(keyword)}&limit=30`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      const json = await res.json()
      return json.jobs ?? []
    },
    parse(jobs) {
      return jobs.map((j) => ({
        title: j.title ?? '',
        company: j.company_name ?? '',
        link: j.url ?? '',
        description: stripHtml(j.description ?? '').slice(0, 400),
        published_date: (j.publication_date ?? '').split('T')[0] || today(),
      }))
    },
  },

  // Himalayas — free public JSON API, no auth. Remote jobs with India location filter.
  himalayas: {
    label: 'Himalayas (Remote, India)',
    async fetch(keyword) {
      const url = `https://himalayas.app/jobs/api?search=${encodeURIComponent(keyword)}&locationRestrictions=India&limit=30`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      const json = await res.json()
      return json.jobs ?? []
    },
    parse(jobs) {
      return jobs.map((j) => ({
        title: j.title ?? '',
        company: j.companyName ?? j.company?.name ?? '',
        link: j.applicationLink ?? `https://himalayas.app/jobs/${j.slug ?? ''}`,
        description: stripHtml(j.description ?? '').slice(0, 400),
        published_date: (j.createdAt ?? j.publishedAt ?? '').split('T')[0] || today(),
      }))
    },
  },

  // Adzuna — free API key required (register at developer.adzuna.com). India-native results.
  // Aggregates listings from Naukri, LinkedIn, and direct company pages.
  adzuna: {
    label: 'Adzuna India',
    async fetch(keyword) {
      const appId = process.env.ADZUNA_APP_ID
      const appKey = process.env.ADZUNA_APP_KEY
      if (!appId || !appKey) {
        throw new Error(
          'Adzuna requires ADZUNA_APP_ID and ADZUNA_APP_KEY env vars.\n' +
          '  → Register free at https://developer.adzuna.com'
        )
      }
      const url =
        `https://api.adzuna.com/v1/api/jobs/in/search/1` +
        `?app_id=${encodeURIComponent(appId)}` +
        `&app_key=${encodeURIComponent(appKey)}` +
        `&what=${encodeURIComponent(keyword)}` +
        `&where=Bengaluru` +
        `&results_per_page=20` +
        `&content-type=application/json`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      const json = await res.json()
      return json.results ?? []
    },
    parse(jobs) {
      return jobs.map((j) => ({
        title: j.title ?? '',
        company: j.company?.display_name ?? '',
        link: j.redirect_url ?? '',
        description: stripHtml(j.description ?? '').slice(0, 400),
        published_date: (j.created ?? '').split('T')[0] || today(),
      }))
    },
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0]
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// ── PocketBase fetch helper ───────────────────────────────────────────────────
async function pbFetch(path, { headers: extraHeaders = {}, ...rest } = {}) {
  const res = await fetch(`${PB_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    ...rest,
  })
  let body
  try { body = await res.json() } catch { body = {} }
  if (!res.ok) {
    const detail = body.data ? '\n' + JSON.stringify(body.data, null, 2) : ''
    throw new Error(`${body.message || `HTTP ${res.status}`}${detail}`)
  }
  return body
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('🔐 Authenticating…')
  const auth = await pbFetch('/api/admins/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity: email, password }),
  })
  const H = { Authorization: `Bearer ${auth.token}` }
  console.log('✅ Authenticated')

  const alertsRes = await pbFetch(
    '/api/collections/alerts/records?filter=active%3Dtrue&perPage=50',
    { headers: H }
  )
  const alerts = alertsRes.items ?? []
  console.log(`\n📋 Found ${alerts.length} active alert(s)`)

  if (alerts.length === 0) {
    console.log('No active alerts. Add one via the Alerts page first.')
    return
  }

  const existingRes = await pbFetch(
    '/api/collections/job_listings/records?perPage=500&fields=link',
    { headers: H }
  )
  const existingLinks = new Set((existingRes.items ?? []).map((r) => r.link))
  console.log(`   ${existingLinks.size} existing listing(s) in DB`)

  for (const alert of alerts) {
    const source = alert.source || 'remotive'
    const sourceHandler = SOURCES[source]

    if (!sourceHandler) {
      console.log(`\n⚠️  Unknown source "${source}" for alert "${alert.keyword}" — skipping`)
      console.log(`   Supported sources: ${Object.keys(SOURCES).join(', ')}`)
      continue
    }

    console.log(`\n🔍 ${sourceHandler.label} — "${alert.keyword}"`)

    let rawJobs
    try {
      rawJobs = await sourceHandler.fetch(alert.keyword)
    } catch (e) {
      console.error(`   ❌ Fetch failed: ${e.message}`)
      continue
    }

    const jobs = sourceHandler.parse(rawJobs)
    console.log(`   📋 Fetched ${jobs.length} listing(s)`)

    let added = 0
    for (const job of jobs) {
      if (!job.link || existingLinks.has(job.link)) continue
      try {
        await pbFetch('/api/collections/job_listings/records', {
          method: 'POST',
          headers: H,
          body: JSON.stringify({ ...job, alert: alert.id, saved: false }),
        })
        existingLinks.add(job.link)
        added++
      } catch (e) {
        console.error(`   ❌ Could not save "${job.title}": ${e.message}`)
      }
    }
    console.log(`   ✅ Added ${added} new listing(s)`)

    try {
      await pbFetch(`/api/collections/alerts/records/${alert.id}`, {
        method: 'PATCH',
        headers: H,
        body: JSON.stringify({ last_checked: today() }),
      })
    } catch (_) { /* non-critical */ }
  }

  console.log('\n🎉 Done!')
}

run().catch((e) => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
