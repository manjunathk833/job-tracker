/**
 * PocketBase Schema Setup Script
 * Run once after creating your PocketBase admin account:
 *
 *   node scripts/setup-pb.js <admin-email> <admin-password>
 *
 * Example:
 *   node scripts/setup-pb.js admin@local.dev password123
 */

const PB_URL = 'http://localhost:8090'

const [, , email, password] = process.argv
if (!email || !password) {
  console.error('Usage: node scripts/setup-pb.js <admin-email> <admin-password>')
  process.exit(1)
}

// Field builders — every field MUST have an options object matching its type
const text = (name, required = false) => ({
  name, type: 'text', required,
  options: { min: null, max: null, pattern: '' },
})
const sel = (name, values, required = false) => ({
  name, type: 'select', required,
  options: { maxSelect: 1, values },
})
const date = (name) => ({
  name, type: 'date', required: false,
  options: { min: '', max: '' },
})
const bool = (name) => ({
  name, type: 'bool', required: false,
  options: {},
})
const json = (name) => ({
  name, type: 'json', required: false,
  options: { maxSize: 2000000 },
})

// Empty string = public; null = admin-only
const publicRules = {
  listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: '',
}

const collections = [
  {
    name: 'applications',
    type: 'base',
    ...publicRules,
    schema: [
      text('company', true),
      text('role', true),
      sel('status', ['applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted']),
      date('applied_date'),
      sel('source', ['linkedin', 'naukri', 'direct', 'referral', 'alert']),
      text('jd_url'),
      text('resume_version'),
      text('notes'),
      text('salary_range'),
      text('location'),
    ],
  },
  {
    name: 'companies',
    type: 'base',
    ...publicRules,
    schema: [
      text('name', true),
      sel('tier', ['MAANG', 'Tier-1', 'Tier-2', 'Startup']),
      text('website'),
      text('glassdoor_url'),
      text('notes'),
      json('tags'),
    ],
  },
  {
    name: 'alerts',
    type: 'base',
    ...publicRules,
    schema: [
      text('keyword', true),
      text('source'),
      date('last_checked'),
      bool('active'),
    ],
  },
]

// KEY FIX: destructure headers out of opts so spread doesn't overwrite Content-Type
async function pbFetch(path, { headers: extraHeaders = {}, ...rest } = {}) {
  const res = await fetch(`${PB_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    ...rest,
  })
  let body
  try { body = await res.json() } catch { body = {} }
  if (!res.ok) {
    // Print the full PocketBase error for debugging
    const detail = body.data ? JSON.stringify(body.data, null, 2) : ''
    throw new Error(`${body.message || `HTTP ${res.status}`}\n${detail}`)
  }
  return body
}

async function run() {
  // 1. Authenticate as admin
  console.log('🔐 Authenticating with PocketBase admin…')
  const auth = await pbFetch('/api/admins/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity: email, password }),
  })
  const authHeaders = { Authorization: `Bearer ${auth.token}` }
  console.log('✅ Authenticated')

  // 2. Create collections
  for (const col of collections) {
    try {
      await pbFetch('/api/collections', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(col),
      })
      console.log(`✅ Created collection: ${col.name}`)
    } catch (e) {
      const msg = e.message ?? ''
      if (msg.includes('already exists') || msg.includes('name')) {
        console.log(`⏭  Skipped (already exists): ${col.name}`)
      } else {
        console.error(`❌ Failed to create ${col.name}:\n${msg}`)
      }
    }
  }

  // 3. Seed 5 sample applications
  console.log('\n📝 Seeding 5 sample applications…')
  const samples = [
    { company: 'Google',    role: 'Senior SDET',        status: 'interview', applied_date: '2026-02-10 00:00:00.000Z', source: 'linkedin', location: 'Bengaluru',          salary_range: '50-70 LPA', resume_version: 'v3-sdet-maang' },
    { company: 'Microsoft', role: 'SDET II',             status: 'screening', applied_date: '2026-02-15 00:00:00.000Z', source: 'referral', location: 'Hyderabad',          salary_range: '40-55 LPA', resume_version: 'v3-sdet-maang' },
    { company: 'Amazon',    role: 'SDE-II (Test)',       status: 'applied',   applied_date: '2026-02-20 00:00:00.000Z', source: 'direct',   location: 'Bengaluru / Remote', resume_version: 'v3-sdet-maang' },
    { company: 'Flipkart',  role: 'Senior QA Engineer', status: 'rejected',  applied_date: '2026-02-01 00:00:00.000Z', source: 'naukri',   location: 'Bengaluru',          salary_range: '30-40 LPA' },
    { company: 'PhonePe',   role: 'Staff SDET',         status: 'ghosted',   applied_date: '2026-01-25 00:00:00.000Z', source: 'linkedin', location: 'Bengaluru',          salary_range: '35-45 LPA' },
  ]

  for (const app of samples) {
    try {
      await pbFetch('/api/collections/applications/records', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(app),
      })
      console.log(`  ✅ ${app.company} — ${app.role}`)
    } catch (e) {
      console.error(`  ❌ ${app.company}: ${e.message}`)
    }
  }

  console.log('\n🎉 Done! Open http://localhost:5173/applications to see your data.')
}

run().catch((e) => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
