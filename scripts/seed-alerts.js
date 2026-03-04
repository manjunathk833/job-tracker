/**
 * Seed comprehensive SDET/QA alerts across all sources.
 * Safe to re-run — skips duplicates (matched by keyword + source).
 *
 * Usage:
 *   node scripts/seed-alerts.js <admin-email> <admin-password>
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
try {
  const lines = readFileSync(resolve(__dirname, '../.env'), 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !(key in process.env)) process.env[key] = val
  }
} catch (_) {}

const PB_URL = process.env.VITE_PB_URL || 'http://localhost:8090'
const [, , email, password] = process.argv

if (!email || !password) {
  console.error('Usage: node scripts/seed-alerts.js <admin-email> <admin-password>')
  process.exit(1)
}

// ── Desired alerts ────────────────────────────────────────────────────────────
const DESIRED_ALERTS = [
  // Remotive — remote global QA/SDET jobs (no key needed)
  { keyword: 'SDET',                      source: 'remotive' },
  { keyword: 'Test Automation Engineer',  source: 'remotive' },
  { keyword: 'QA Automation',             source: 'remotive' },

  // Himalayas — remote jobs with India location filter (no key needed)
  { keyword: 'SDET',                      source: 'himalayas' },
  { keyword: 'QA Automation Engineer',    source: 'himalayas' },
  { keyword: 'Senior QA Engineer',        source: 'himalayas' },

  // Adzuna India — on-site/hybrid India listings (free API key required)
  { keyword: 'Senior SDET',               source: 'adzuna' },
  { keyword: 'SDET',                      source: 'adzuna' },
  { keyword: 'QA Automation Engineer',    source: 'adzuna' },
  { keyword: 'Test Automation Engineer',  source: 'adzuna' },
  { keyword: 'Staff SDET',                source: 'adzuna' },
]

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

async function run() {
  const hasAdzuna = process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY

  if (!hasAdzuna) {
    console.log('ℹ️  ADZUNA_APP_ID / ADZUNA_APP_KEY not set in .env — skipping Adzuna alerts')
    console.log('   Register free at https://developer.adzuna.com\n')
  }

  console.log('🔐 Authenticating…')
  const auth = await pbFetch('/api/admins/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity: email, password }),
  })
  const H = { Authorization: `Bearer ${auth.token}` }
  console.log('✅ Authenticated\n')

  // Load existing alerts to detect duplicates
  const existing = await pbFetch('/api/collections/alerts/records?perPage=200', { headers: H })
  const existingSet = new Set(
    (existing.items ?? []).map((a) => `${a.keyword}::${a.source}`)
  )
  console.log(`   ${existingSet.size} existing alert(s) found\n`)

  const toCreate = DESIRED_ALERTS.filter((a) => {
    if (a.source === 'adzuna' && !hasAdzuna) return false
    return !existingSet.has(`${a.keyword}::${a.source}`)
  })

  if (toCreate.length === 0) {
    console.log('✅ All desired alerts already exist — nothing to add.')
    return
  }

  console.log(`📝 Creating ${toCreate.length} alert(s)…`)
  for (const alert of toCreate) {
    try {
      await pbFetch('/api/collections/alerts/records', {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ ...alert, active: true }),
      })
      console.log(`  ✅ [${alert.source.padEnd(10)}] ${alert.keyword}`)
    } catch (e) {
      console.error(`  ❌ [${alert.source}] ${alert.keyword}: ${e.message}`)
    }
  }

  const total = (existing.items?.length ?? 0) + toCreate.length
  console.log(`\n🎉 Done — ${total} total alert(s) active.`)
  console.log('\nNow run: node scripts/job-alert-cron.js <email> <password>')
}

run().catch((e) => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
