import { useEffect, useMemo } from 'react'
import { Building2 } from 'lucide-react'
import StatusBadge from '@/components/applications/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useApplicationStore from '@/store/applicationStore'
import useInterviewStore from '@/store/interviewStore'

export default function Companies() {
  const fetchApplications = useApplicationStore((s) => s.fetchApplications)
  const applications = useApplicationStore((s) => s.applications)
  const fetchInterviews = useInterviewStore((s) => s.fetchInterviews)
  const interviews = useInterviewStore((s) => s.interviews)

  useEffect(() => {
    fetchApplications()
    fetchInterviews()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Group applications by company name
  const companies = useMemo(() => {
    const map = {}
    for (const app of applications) {
      const key = app.company?.trim() || 'Unknown'
      if (!map[key]) map[key] = { name: key, apps: [], interviewCount: 0 }
      map[key].apps.push(app)
    }
    // Count interviews per company
    for (const iv of interviews) {
      // Find the application this interview belongs to
      const app = applications.find((a) => a.id === iv.application)
      if (app) {
        const key = app.company?.trim() || 'Unknown'
        if (map[key]) map[key].interviewCount++
      }
    }
    // Sort by most recent application date
    return Object.values(map).sort((a, b) => {
      const aDate = Math.max(...a.apps.map((ap) => new Date(ap.applied_date || 0).getTime()))
      const bDate = Math.max(...b.apps.map((ap) => new Date(ap.applied_date || 0).getTime()))
      return bDate - aDate
    })
  }, [applications, interviews])

  if (!companies.length) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Companies</h3>
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">No companies yet — add applications first.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">Companies</h3>
        <p className="text-sm text-muted-foreground">
          {companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} tracked
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map(({ name, apps, interviewCount }) => {
          // Count by status
          const byStatus = {}
          for (const app of apps) {
            byStatus[app.status] = (byStatus[app.status] ?? 0) + 1
          }
          // Latest application
          return (
            <Card key={name} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-indigo-600" />
                  </div>
                  {name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Stats row */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-muted text-muted-foreground">
                    {apps.length} application{apps.length !== 1 ? 's' : ''}
                  </span>
                  {interviewCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-purple-50 text-purple-700 border-purple-200">
                      {interviewCount} interview round{interviewCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Status breakdown */}
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(byStatus).map(([status]) => (
                    <StatusBadge key={status} status={status} />
                  ))}
                </div>

                {/* Roles applied */}
                <div className="space-y-1">
                  {apps.map((app) => (
                    <div key={app.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate">{app.role}</span>
                      <StatusBadge status={app.status} className="ml-2 shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
