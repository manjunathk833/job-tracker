import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import InterviewCard from '@/components/interviews/InterviewCard'
import InterviewForm from '@/components/interviews/InterviewForm'
import { ROUND_OPTIONS, INTERVIEW_STATUS_OPTIONS } from '@/utils/constants'
import useInterviewStore from '@/store/interviewStore'
import useApplicationStore from '@/store/applicationStore'

export default function Interviews() {
  const fetchInterviews = useInterviewStore((s) => s.fetchInterviews)
  const interviews = useInterviewStore((s) => s.interviews)
  const deleteInterview = useInterviewStore((s) => s.deleteInterview)
  const loading = useInterviewStore((s) => s.loading)

  const fetchApplications = useApplicationStore((s) => s.fetchApplications)
  const applications = useApplicationStore((s) => s.applications)

  const [formOpen, setFormOpen] = useState(false)
  const [editInterview, setEditInterview] = useState(null)
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRound, setFilterRound] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchInterviews()
    fetchApplications()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Build app lookup map for interview → company/role display
  const appMap = useMemo(
    () => Object.fromEntries(applications.map((a) => [a.id, a])),
    [applications]
  )

  const filtered = useMemo(() => {
    return interviews.filter((iv) => {
      const app = iv.expand?.application ?? appMap[iv.application] ?? {}
      if (filterStatus !== 'all' && iv.status !== filterStatus) return false
      if (filterRound !== 'all' && iv.round !== filterRound) return false
      if (search) {
        const q = search.toLowerCase()
        const matches = (app.company ?? '').toLowerCase().includes(q)
          || (app.role ?? '').toLowerCase().includes(q)
          || (iv.round ?? '').toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [interviews, filterStatus, filterRound, search, appMap])

  // Group by application
  const grouped = useMemo(() => {
    const groups = {}
    for (const iv of filtered) {
      const app = iv.expand?.application ?? appMap[iv.application] ?? {}
      const key = iv.application
      if (!groups[key]) groups[key] = { app, items: [] }
      groups[key].items.push(iv)
    }
    return Object.values(groups)
  }, [filtered, appMap])

  const openAdd = (appId = null) => {
    setEditInterview(null)
    setSelectedAppId(appId)
    setFormOpen(true)
  }
  const openEdit = (iv) => {
    setEditInterview(iv)
    setSelectedAppId(null)
    setFormOpen(true)
  }
  const closeForm = () => {
    setFormOpen(false)
    setEditInterview(null)
    setSelectedAppId(null)
    fetchInterviews()
  }

  const handleDelete = async (id) => {
    await deleteInterview(id)
    toast.success('Interview round deleted')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Interviews</h3>
          <p className="text-sm text-muted-foreground">All rounds and question banks</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => openAdd()}>
          <Plus size={16} /> Add Round
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Search company, role, round…"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {INTERVIEW_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRound} onValueChange={setFilterRound}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Rounds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rounds</SelectItem>
            {ROUND_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground self-center">
          {filtered.length} round{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading interviews…</div>
      ) : grouped.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">No interview rounds found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Open an application's detail drawer and click "Add Round", or click "Add Round" above.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ app, items }) => (
            <div key={app.id ?? 'unknown'}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm">{app.company ?? 'Unknown Company'}</span>
                  <span className="text-muted-foreground text-sm ml-2">· {app.role ?? ''}</span>
                </div>
                <Button
                  size="sm" variant="ghost" className="gap-1 h-7 text-xs text-muted-foreground"
                  onClick={() => openAdd(app.id)}>
                  <Plus size={12} /> Add Round
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((iv) => (
                  <InterviewCard
                    key={iv.id}
                    interview={iv}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <InterviewForm
        open={formOpen}
        onClose={closeForm}
        editInterview={editInterview}
        applicationId={selectedAppId}
      />
    </div>
  )
}
