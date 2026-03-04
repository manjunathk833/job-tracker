import { useMemo, useEffect } from 'react'
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import useApplicationStore from '@/store/applicationStore'
import useInterviewStore from '@/store/interviewStore'
import StatsOverview from '@/components/insights/StatsOverview'
import WeeklyProgress from '@/components/insights/WeeklyProgress'
import { computeStats, computeWeeklyData, generateInsights } from '@/utils/insights'

const INSIGHT_ICON = { warning: AlertTriangle, info: Info, success: CheckCircle2 }
const INSIGHT_STYLE = {
  warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
  info: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  success: 'text-green-600 bg-green-50 dark:bg-green-950',
}

export default function Dashboard() {
  const fetchApplications = useApplicationStore((s) => s.fetchApplications)
  const applications = useApplicationStore((s) => s.applications)
  const fetchInterviews = useInterviewStore((s) => s.fetchInterviews)
  const interviews = useInterviewStore((s) => s.interviews)

  useEffect(() => {
    fetchApplications()
    fetchInterviews()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => computeStats(applications), [applications])
  const weeklyData = useMemo(() => computeWeeklyData(applications), [applications])
  const insights = useMemo(() => generateInsights(applications), [applications])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Welcome back 👋</h3>
        <p className="text-muted-foreground mt-1">Your MAANG job hunt at a glance</p>
      </div>

      <StatsOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyProgress data={weeklyData} />

        {/* Quick insights */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-4">Insights</p>
          <div className="space-y-3">
            {insights.map((insight, i) => {
              const Icon = INSIGHT_ICON[insight.type]
              return (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`p-1.5 rounded-lg shrink-0 ${INSIGHT_STYLE[insight.type]}`}>
                    <Icon size={14} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Recent Activity</p>
          <span className="text-xs text-muted-foreground">{interviews.length} interview rounds total</span>
        </div>
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="space-y-0">
            {[...applications]
              .sort((a, b) => new Date(b.created) - new Date(a.created))
              .slice(0, 5)
              .map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-2.5 border-b last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium">{app.company}</span>
                    <span className="text-xs text-muted-foreground ml-2">{app.role}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {app.applied_date
                      ? new Date(app.applied_date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
