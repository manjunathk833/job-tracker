export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function parseCompanyFromUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    const domain = hostname.split('.')[0]
    return domain.charAt(0).toUpperCase() + domain.slice(1)
  } catch {
    return ''
  }
}

export function daysAgo(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}
