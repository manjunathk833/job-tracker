/**
 * PocketBase Schema Setup Script
 * Run once after creating your PocketBase admin account:
 *
 *   node scripts/setup-pb.js <admin-email> <admin-password>
 *
 * Example:
 *   node scripts/setup-pb.js admin@local.dev password123
 */

const PB_URL = process.env.VITE_PB_URL || 'http://localhost:8090'

const [, , email, password] = process.argv
if (!email || !password) {
  console.error('Usage: node scripts/setup-pb.js <admin-email> <admin-password>')
  process.exit(1)
}

async function pbFetch(path, options = {}) {
  const res = await fetch(`${PB_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
  return json
}

async function run() {
  // 1. Authenticate as admin
  console.log('🔐 Authenticating with PocketBase admin…')
  const auth = await pbFetch('/api/admins/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity: email, password }),
  })
  const token = auth.token
  const headers = { Authorization: token }
  console.log('✅ Authenticated')

  // 2. Create collections
  const collections = [
    {
      name: 'applications',
      type: 'base',
      schema: [
        { name: 'company',        type: 'text',   required: true },
        { name: 'role',           type: 'text',   required: true },
        { name: 'status',         type: 'select', required: false, options: { maxSelect: 1, values: ['applied','screening','interview','offer','rejected','ghosted'] } },
        { name: 'applied_date',   type: 'date',   required: false },
        { name: 'source',         type: 'select', required: false, options: { maxSelect: 1, values: ['linkedin','naukri','direct','referral','alert'] } },
        { name: 'jd_url',         type: 'url',    required: false },
        { name: 'resume_version', type: 'text',   required: false },
        { name: 'notes',          type: 'text',   required: false, options: { max: 10000 } },
        { name: 'salary_range',   type: 'text',   required: false },
        { name: 'location',       type: 'text',   required: false },
      ],
    },
    {
      name: 'companies',
      type: 'base',
      schema: [
        { name: 'name',          type: 'text',   required: true },
        { name: 'tier',          type: 'select', required: false, options: { maxSelect: 1, values: ['MAANG','Tier-1','Tier-2','Startup'] } },
        { name: 'website',       type: 'url',    required: false },
        { name: 'glassdoor_url', type: 'url',    required: false },
        { name: 'notes',         type: 'text',   required: false },
        { name: 'tags',          type: 'json',   required: false },
      ],
    },
    {
      name: 'alerts',
      type: 'base',
      schema: [
        { name: 'keyword',      type: 'text', required: true },
        { name: 'source',       type: 'text', required: false },
        { name: 'last_checked', type: 'date', required: false },
        { name: 'active',       type: 'bool', required: false },
      ],
    },
  ]

  for (const col of collections) {
    try {
      await pbFetch('/api/collections', {
        method: 'POST',
        headers,
        body: JSON.stringify(col),
      })
      console.log(`✅ Created collection: ${col.name}`)
    } catch (e) {
      if (e.message?.includes('already exists') || e.message?.includes('unique')) {
        console.log(`⏭  Skipped (already exists): ${col.name}`)
      } else {
        console.error(`❌ Failed to create ${col.name}:`, e.message)
      }
    }
  }

  // 3. Seed 5 sample applications
  console.log('\n📝 Seeding 5 sample applications…')
  const samples = [
    { company: 'Google', role: 'Senior SDET', status: 'interview', applied_date: '2026-02-10', source: 'linkedin', location: 'Bengaluru', salary_range: '50-70 LPA', resume_version: 'v3-sdet-maang' },
    { company: 'Microsoft', role: 'SDET II', status: 'screening', applied_date: '2026-02-15', source: 'referral', location: 'Hyderabad', salary_range: '40-55 LPA', resume_version: 'v3-sdet-maang' },
    { company: 'Amazon', role: 'SDE-II (Test)', status: 'applied', applied_date: '2026-02-20', source: 'direct', location: 'Bengaluru / Remote', resume_version: 'v3-sdet-maang' },
    { company: 'Flipkart', role: 'Senior QA Engineer', status: 'rejected', applied_date: '2026-02-01', source: 'naukri', location: 'Bengaluru', salary_range: '30-40 LPA' },
    { company: 'PhonePe', role: 'Staff SDET', status: 'ghosted', applied_date: '2026-01-25', source: 'linkedin', location: 'Bengaluru', salary_range: '35-45 LPA' },
  ]

  for (const app of samples) {
    try {
      await pbFetch('/api/collections/applications/records', {
        method: 'POST',
        headers,
        body: JSON.stringify(app),
      })
      console.log(`  ✅ ${app.company} — ${app.role}`)
    } catch (e) {
      console.error(`  ❌ ${app.company}:`, e.message)
    }
  }

  console.log('\n🎉 Setup complete! Open http://localhost:5173/applications to see your data.')
}

run().catch((e) => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
