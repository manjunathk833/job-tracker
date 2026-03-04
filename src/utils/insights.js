export function computeStats(applications) {
  const total = applications.length
  const active = applications.filter((a) =>
    ['screening', 'interview'].includes(a.status)
  ).length
  const offers = applications.filter((a) => a.status === 'offer').length
  const rejected = applications.filter((a) => a.status === 'rejected').length
  const ghosted = applications.filter((a) => a.status === 'ghosted').length
  const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0
  const stillApplied = applications.filter((a) => a.status === 'applied').length
  const responseRate =
    total > 0 ? Math.round(((total - ghosted - stillApplied) / total) * 100) : 0

  return { total, active, offers, rejected, ghosted, rejectionRate, responseRate }
}

export function computeFunnelData(applications) {
  const stageOrder = { applied: 0, screening: 1, interview: 2, offer: 3, rejected: -1, ghosted: -1 }
  const stages = [
    { key: 'applied', label: 'Applied' },
    { key: 'screening', label: 'Screening' },
    { key: 'interview', label: 'Interview' },
    { key: 'offer', label: 'Offer' },
  ]

  return stages.map(({ key, label }) => ({
    stage: label,
    count: applications.filter((a) => {
      const rank = stageOrder[a.status]
      return rank !== undefined && rank >= stageOrder[key]
    }).length,
  }))
}

export function computeWeeklyData(applications, weeks = 8) {
  const now = new Date()
  // Start from Monday of (weeks-1) weeks ago
  const result = []

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - i * 7 - ((now.getDay() + 6) % 7))
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const count = applications.filter((a) => {
      if (!a.applied_date) return false
      const d = new Date(a.applied_date)
      return d >= weekStart && d < weekEnd
    }).length

    const label = weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    result.push({ week: label, count })
  }

  return result
}

export function computeSourceBreakdown(applications) {
  const counts = {}
  for (const a of applications) {
    const src = a.source || 'other'
    counts[src] = (counts[src] || 0) + 1
  }
  const total = applications.length || 1
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([source, count]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      count,
      pct: Math.round((count / total) * 100),
    }))
}

export function generateInsights(applications) {
  if (!applications.length) return []

  const insights = []
  const total = applications.length
  const ghosted = applications.filter((a) => a.status === 'ghosted').length
  const rejected = applications.filter((a) => a.status === 'rejected').length
  const stillApplied = applications.filter((a) => a.status === 'applied').length
  const responseRate =
    total > 0 ? Math.round(((total - ghosted - stillApplied) / total) * 100) : 0

  const linkedinCount = applications.filter((a) => a.source === 'linkedin').length
  const linkedinShare = Math.round((linkedinCount / total) * 100)

  const recentCutoff = new Date()
  recentCutoff.setDate(recentCutoff.getDate() - 7)
  const recentApps = applications.filter(
    (a) => a.applied_date && new Date(a.applied_date) >= recentCutoff
  )

  if (responseRate < 20 && total >= 5) {
    insights.push({
      type: 'warning',
      text: 'Response rate is below 20% — ATS may be filtering your resume. Review keyword match with JDs.',
    })
  }

  if (ghosted > 5) {
    insights.push({
      type: 'warning',
      text: `${ghosted} applications ghosted — follow up on applications older than 7 days.`,
    })
  }

  if (rejected > 3) {
    insights.push({
      type: 'info',
      text: `${rejected} rejections tracked — prioritize DSA practice if rejections are post-technical rounds.`,
    })
  }

  if (linkedinShare > 80 && total >= 5) {
    insights.push({
      type: 'info',
      text: `${linkedinShare}% of applications from LinkedIn — diversify to Naukri and direct company portals.`,
    })
  }

  if (recentApps.length === 0) {
    insights.push({
      type: 'warning',
      text: 'No applications in the last 7 days — target 3 new applications today.',
    })
  }

  if (insights.length === 0) {
    insights.push({
      type: 'success',
      text: 'Pipeline looks healthy — keep the momentum going!',
    })
  }

  return insights
}
