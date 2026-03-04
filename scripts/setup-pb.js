/**
 * PocketBase Schema Setup Script
 * Run once (safe to re-run — skips existing collections/records):
 *
 *   node scripts/setup-pb.js <admin-email> <admin-password>
 */

const PB_URL = 'http://localhost:8090'

const [, , email, password] = process.argv
if (!email || !password) {
  console.error('Usage: node scripts/setup-pb.js <admin-email> <admin-password>')
  process.exit(1)
}

// ── Field builders (every field needs a typed options object) ──────────────
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
const relation = (name, collectionId, required = false) => ({
  name, type: 'relation', required,
  options: { collectionId, cascadeDelete: true, minSelect: null, maxSelect: 1, displayFields: null },
})

const publicRules = {
  listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: '',
}

// ── Fetch helper ────────────────────────────────────────────────────────────
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

// ── Main ────────────────────────────────────────────────────────────────────
async function run() {
  // 1. Auth
  console.log('🔐 Authenticating…')
  const auth = await pbFetch('/api/admins/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity: email, password }),
  })
  const H = { Authorization: `Bearer ${auth.token}` }
  console.log('✅ Authenticated')

  // 2. Fetch existing collections (to check what already exists + get IDs)
  const existing = await pbFetch('/api/collections?perPage=200', { headers: H })
  const existingMap = Object.fromEntries((existing.items ?? []).map(c => [c.name, c.id]))
  console.log(`   Found ${Object.keys(existingMap).length} existing collections`)

  // 3. Build collection definitions (interviews needs applications ID)
  const applicationsId = existingMap['applications']

  const collections = [
    {
      name: 'applications',
      type: 'base', ...publicRules,
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
      name: 'interviews',
      type: 'base', ...publicRules,
      schema: [
        ...(applicationsId
          ? [relation('application', applicationsId, true)]
          : [text('application', true)]), // fallback if applications missing
        sel('round', ['HR', 'Technical-1', 'Technical-2', 'System-Design', 'Bar-Raiser', 'Final']),
        date('scheduled_date'),
        sel('status', ['scheduled', 'completed', 'cancelled']),
        text('interviewer_name'),
        text('feedback'),
        json('questions'), // [{question, answer, difficulty}]
      ],
    },
    {
      name: 'companies',
      type: 'base', ...publicRules,
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
      type: 'base', ...publicRules,
      schema: [
        text('keyword', true),
        text('source'),
        date('last_checked'),
        bool('active'),
      ],
    },
  ]

  // 4. Create missing collections
  console.log('')
  for (const col of collections) {
    if (existingMap[col.name]) {
      console.log(`⏭  Skipped (exists): ${col.name}`)
      continue
    }
    try {
      const created = await pbFetch('/api/collections', {
        method: 'POST', headers: H,
        body: JSON.stringify(col),
      })
      existingMap[col.name] = created.id // store ID for later use
      console.log(`✅ Created: ${col.name}`)
    } catch (e) {
      console.error(`❌ Failed to create ${col.name}:\n${e.message}`)
    }
  }

  // 5. Create job_listings collection (needs alerts ID — done separately after main loop)
  console.log('')
  const alertsId = existingMap['alerts']
  if (existingMap['job_listings']) {
    console.log('⏭  Skipped (exists): job_listings')
  } else if (!alertsId) {
    console.error('❌ Cannot create job_listings: alerts collection not found')
  } else {
    try {
      const jl = await pbFetch('/api/collections', {
        method: 'POST', headers: H,
        body: JSON.stringify({
          name: 'job_listings',
          type: 'base', ...publicRules,
          schema: [
            relation('alert', alertsId, false),
            text('title', true),
            text('company'),
            text('link'),
            text('description'),
            date('published_date'),
            bool('saved'),
          ],
        }),
      })
      existingMap['job_listings'] = jl.id
      console.log('✅ Created: job_listings')
    } catch (e) {
      console.error(`❌ Failed to create job_listings:\n${e.message}`)
    }
  }

  // 5. Seed applications (skip if already have data)
  console.log('\n📝 Seeding sample applications…')
  const appCheck = await pbFetch('/api/collections/applications/records?perPage=1', { headers: H })
  if (appCheck.totalItems > 0) {
    console.log(`⏭  Skipped (${appCheck.totalItems} applications already exist)`)
  } else {
    const appSamples = [
      { company: 'Google',    role: 'Senior SDET',        status: 'interview', applied_date: '2026-02-10 00:00:00.000Z', source: 'linkedin', location: 'Bengaluru',           salary_range: '50-70 LPA', resume_version: 'v3-sdet-maang' },
      { company: 'Microsoft', role: 'SDET II',             status: 'screening', applied_date: '2026-02-15 00:00:00.000Z', source: 'referral', location: 'Hyderabad',           salary_range: '40-55 LPA', resume_version: 'v3-sdet-maang' },
      { company: 'Amazon',    role: 'SDE-II (Test)',       status: 'applied',   applied_date: '2026-02-20 00:00:00.000Z', source: 'direct',   location: 'Bengaluru / Remote',  resume_version: 'v3-sdet-maang' },
      { company: 'Flipkart',  role: 'Senior QA Engineer', status: 'rejected',  applied_date: '2026-02-01 00:00:00.000Z', source: 'naukri',   location: 'Bengaluru',           salary_range: '30-40 LPA' },
      { company: 'PhonePe',   role: 'Staff SDET',         status: 'ghosted',   applied_date: '2026-01-25 00:00:00.000Z', source: 'linkedin', location: 'Bengaluru',           salary_range: '35-45 LPA' },
    ]
    for (const app of appSamples) {
      try {
        await pbFetch('/api/collections/applications/records', { method: 'POST', headers: H, body: JSON.stringify(app) })
        console.log(`  ✅ ${app.company}`)
      } catch (e) { console.error(`  ❌ ${app.company}: ${e.message}`) }
    }
  }

  // 6. Seed sample interviews (linked to Google application)
  console.log('\n📝 Seeding sample interviews…')
  const interviewCheck = await pbFetch('/api/collections/interviews/records?perPage=1', { headers: H }).catch(() => null)
  if (!interviewCheck) {
    console.log('⏭  Skipped (interviews collection not ready)')
  } else if (interviewCheck.totalItems > 0) {
    console.log(`⏭  Skipped (${interviewCheck.totalItems} interviews already exist)`)
  } else {
    // Find Google application
    const googleApps = await pbFetch('/api/collections/applications/records?filter=company%3D%22Google%22', { headers: H })
    const googleId = googleApps.items?.[0]?.id
    if (googleId) {
      const interviewSamples = [
        {
          application: googleId, round: 'HR', status: 'completed',
          scheduled_date: '2026-02-18 00:00:00.000Z', interviewer_name: 'Priya S.',
          feedback: 'Good communication, strong background in test automation',
          questions: JSON.stringify([
            { question: 'Tell me about yourself', answer: '8 years SDET, expert in Selenium and API testing', difficulty: 'Easy' },
            { question: 'Why Google?', answer: 'Scale, impact, culture of testing excellence', difficulty: 'Easy' },
          ]),
        },
        {
          application: googleId, round: 'Technical-1', status: 'completed',
          scheduled_date: '2026-02-25 00:00:00.000Z', interviewer_name: 'Rahul M.',
          feedback: 'Strong DSA, needs work on system design for testing infrastructure',
          questions: JSON.stringify([
            { question: 'Design a test framework for Google Search', answer: 'Layered approach: unit tests for ranking, integration for pipeline, E2E for UX', difficulty: 'Hard' },
            { question: 'Find all duplicate subtrees in a binary tree', answer: 'Serialize subtrees and use hashmap to find duplicates — O(n)', difficulty: 'Medium' },
            { question: 'How would you test Google Maps?', answer: 'Functional, performance, offline mode, accuracy, edge cases (no GPS)', difficulty: 'Medium' },
          ]),
        },
      ]
      for (const iv of interviewSamples) {
        try {
          await pbFetch('/api/collections/interviews/records', { method: 'POST', headers: H, body: JSON.stringify(iv) })
          console.log(`  ✅ Google — ${iv.round}`)
        } catch (e) { console.error(`  ❌ Google ${iv.round}: ${e.message}`) }
      }
    }
  }

  // 7. Seed default alert (Senior SDET on Indeed)
  console.log('\n📝 Seeding default alert…')
  const alertCheck = await pbFetch('/api/collections/alerts/records?perPage=1', { headers: H }).catch(() => null)
  if (!alertCheck) {
    console.log('⏭  Skipped (alerts collection not ready)')
  } else if (alertCheck.totalItems > 0) {
    console.log(`⏭  Skipped (${alertCheck.totalItems} alert(s) already exist)`)
  } else {
    try {
      await pbFetch('/api/collections/alerts/records', {
        method: 'POST', headers: H,
        body: JSON.stringify({ keyword: 'Senior SDET', source: 'indeed', active: true }),
      })
      console.log('  ✅ Alert: Senior SDET (Indeed)')
    } catch (e) {
      console.error(`  ❌ Alert seed: ${e.message}`)
    }
  }

  console.log('\n🎉 Done! http://localhost:5173')
}

run().catch((e) => { console.error('Fatal:', e.message); process.exit(1) })
