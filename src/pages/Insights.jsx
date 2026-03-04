import { useMemo, useEffect } from 'react'
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import useApplicationStore from '@/store/applicationStore'
import StatsOverview from '@/components/insights/StatsOverview'
import FunnelChart from '@/components/insights/FunnelChart'
import {
  computeStats, computeFunnelData, computeSourceBreakdown, generateInsights,
} from '@/utils/insights'

const INSIGHT_ICON = { warning: AlertTriangle, info: Info, success: CheckCircle2 }
const INSIGHT_STYLE = {
  warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800',
  info: 'text-blue-600 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800',
  success: 'text-green-600 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800',
}


export default function Insights() {
  const fetchApplications = useApplicationStore((s) => s.fetchApplications)
  const applications = useApplicationStore((s) => s.applications)

  useEffect(() => {
    fetchApplications()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => computeStats(applications), [applications])
  const funnelData = useMemo(() => computeFunnelData(applications), [applications])
  const sourceData = useMemo(() => computeSourceBreakdown(applications), [applications])
  const insights = useMemo(() => generateInsights(applications), [applications])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Insights</h3>
        <p className="text-sm text-muted-foreground">Performance analytics for your job hunt</p>
      </div>

      <StatsOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FunnelChart data={funnelData} />

        {/* Source breakdown */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-4">Source Breakdown</p>
          {sourceData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={sourceData}
                layout="vertical"
                margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="source" tick={{ fontSize: 11 }} width={70} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v, _n, p) => [`${v} (${p.payload.pct}%)`, 'Applications']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recommendations panel */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold mb-4">Recommendations</p>
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const Icon = INSIGHT_ICON[insight.type]
            return (
              <div
                key={i}
                className={`flex gap-3 items-start p-3 rounded-lg ${INSIGHT_STYLE[insight.type]}`}
              >
                <Icon size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{insight.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
