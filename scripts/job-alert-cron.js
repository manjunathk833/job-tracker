/**
 * Job Alert RSS Cron
 * Fetches RSS feeds for active alerts and stores new listings in PocketBase.
 *
 * Usage:
 *   node scripts/job-alert-cron.js <admin-email> <admin-password>
 *
 * Schedule (crontab example — runs daily at 8PM IST):
 *   30 14 * * * cd /path/to/job-tracker && node scripts/job-alert-cron.js admin@local.dev password123
 */

const PB_URL = process.env.VITE_PB_URL || 'http://localhost:8090'
const [, , email, password] = process.argv

if (!email || !password) {
  console.error('Usage: node scripts/job-alert-cron.js <admin-email> <admin-password>')
  process.exit(1)
}

// ── RSS feed URL builders ────────────────────────────────────────────────────
// Note: in.indeed.com/rss is defunct (404). Use www.indeed.com with country param.
const RSS_FEEDS = {
  // Indeed global — still serves RSS, append India + city to keyword for relevance
  indeed: (keyword) =>
    `https://www.indeed.com/rss?q=${encodeURIComponent(keyword + ' Bengaluru India')}&sort=date`,

  // TimesJobs — major Indian job board with public RSS
  timesjobs: (keyword) =>
    `https://www.timesjobs.com/rss/rss.faces?rssFreeText=${encodeURIComponent(keyword)}&rssLocation=bengaluru`,

  // Remotive — remote jobs RSS (good for remote SDET roles)
  remotive: (_keyword) =>
    `https://remotive.com/remote-jobs/feed/software-dev`,
}

// ── PocketBase fetch helper ──────────────────────────────────────────────────
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

// ── RSS XML parser ───────────────────────────────────────────────────────────
function parseRSS(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const src = match[1]

    const extract = (tag) => {
      const cdata = src.match(
        new RegExp(`<${tag}>[^<]*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>[^<]*<\\/${tag}>`)
      )?.[1]
      const plain = src.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1]
      return (cdata || plain || '').trim()
    }

    const title = extract('title')
    // <link> in RSS 2.0 is a sibling text node, not an element child — handle both formats
    const link =
      extract('link') ||
      src.match(/<link\s*\/?>\s*([^\s<][^<]*)/)?.[1]?.trim() ||
      ''

    const pubDate = extract('pubDate')
    const description = extract('description')

    // Common title formats:
    //   Indeed:    "Job Title - Company Name"
    //   TimesJobs: "Job Title | Company Name" or "Job Title - Company"
    //   Remotive:  "Job Title at Company Name"
    let cleanTitle = title
    let company = ''
    if (title.includes(' - ')) {
      const dashIdx = title.lastIndexOf(' - ')
      cleanTitle = title.slice(0, dashIdx).trim()
      company = title.slice(dashIdx + 3).trim()
    } else if (title.includes(' | ')) {
      const pipeIdx = title.lastIndexOf(' | ')
      cleanTitle = title.slice(0, pipeIdx).trim()
      company = title.slice(pipeIdx + 3).trim()
    } else if (title.includes(' at ')) {
      const atIdx = title.lastIndexOf(' at ')
      cleanTitle = title.slice(0, atIdx).trim()
      company = title.slice(atIdx + 4).trim()
    }

    const cleanDesc = description
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim()
      .slice(0, 400)

    if (cleanTitle && link) {
      items.push({
        title: cleanTitle.replace(/&amp;/g, '&'),
        company: company.replace(/&amp;/g, '&'),
        link,
        description: cleanDesc,
        published_date: pubDate
          ? new Date(pubDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      })
    }
  }

  return items
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  // 1. Authenticate
  console.log('🔐 Authenticating…')
  const auth = await pbFetch('/api/admins/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity: email, password }),
  })
  const H = { Authorization: `Bearer ${auth.token}` }
  console.log('✅ Authenticated')

  // 2. Get active alerts
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

  // 3. Load existing listing links to skip duplicates
  const existingRes = await pbFetch(
    '/api/collections/job_listings/records?perPage=500&fields=link',
    { headers: H }
  )
  const existingLinks = new Set((existingRes.items ?? []).map((r) => r.link))
  console.log(`   ${existingLinks.size} existing listing(s) in DB`)

  // 4. Fetch RSS for each alert
  for (const alert of alerts) {
    const source = alert.source || 'indeed'
    const feedUrl = RSS_FEEDS[source]?.(alert.keyword)

    if (!feedUrl) {
      console.log(`\n⚠️  No RSS feed configured for source "${source}" — skipping`)
      continue
    }

    console.log(`\n🔍 ${source.toUpperCase()} RSS for: "${alert.keyword}"`)
    console.log(`   ${feedUrl}`)

    let xml
    try {
      const res = await fetch(feedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      xml = await res.text()
    } catch (e) {
      console.error(`   ❌ Failed to fetch RSS: ${e.message}`)
      continue
    }

    const items = parseRSS(xml)
    console.log(`   📰 Parsed ${items.length} item(s)`)

    let added = 0
    for (const item of items) {
      if (existingLinks.has(item.link)) continue
      try {
        await pbFetch('/api/collections/job_listings/records', {
          method: 'POST',
          headers: H,
          body: JSON.stringify({ ...item, alert: alert.id, saved: false }),
        })
        existingLinks.add(item.link)
        added++
      } catch (e) {
        console.error(`   ❌ Could not save listing "${item.title}": ${e.message}`)
      }
    }
    console.log(`   ✅ Added ${added} new listing(s)`)

    // Update last_checked
    try {
      await pbFetch(`/api/collections/alerts/records/${alert.id}`, {
        method: 'PATCH',
        headers: H,
        body: JSON.stringify({ last_checked: new Date().toISOString().split('T')[0] }),
      })
    } catch (_) {
      // non-critical
    }
  }

  console.log('\n🎉 Done!')
}

run().catch((e) => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
