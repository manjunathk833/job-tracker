import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ApplicationForm from '@/components/applications/ApplicationForm'
import ApplicationTable from '@/components/applications/ApplicationTable'
import ApplicationDrawer from '@/components/applications/ApplicationDrawer'
import useApplicationStore from '@/store/applicationStore'

function exportToCSV(applications) {
  const cols = ['company', 'role', 'status', 'applied_date', 'source', 'location', 'salary_range', 'resume_version', 'jd_url', 'notes']
  const header = cols.join(',')
  const rows = applications.map((a) =>
    cols.map((c) => {
      const v = a[c] ?? ''
      return `"${String(v).replace(/"/g, '""')}"`
    }).join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Applications() {
  // Select only what we need — stable function reference from store
  const fetchApplications = useApplicationStore((s) => s.fetchApplications)
  const applications = useApplicationStore((s) => s.applications)
  const loading = useApplicationStore((s) => s.loading)
  const error = useApplicationStore((s) => s.error)
  const [formOpen, setFormOpen] = useState(false)
  const [editApp, setEditApp] = useState(null)
  const [selectedApp, setSelectedApp] = useState(null)

  // Empty deps — fetch once on mount only, never re-trigger on store updates
  useEffect(() => {
    fetchApplications()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (error) toast.error(`Failed to load: ${error}`)
  }, [error])

  // N key shortcut — open new application form
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        e.preventDefault()
        setFormOpen(true)
      }
    }
    // Also listen for the custom event dispatched by CommandPalette / other pages
    const custom = () => setFormOpen(true)
    window.addEventListener('keydown', handler)
    window.addEventListener('open-new-application', custom)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('open-new-application', custom)
    }
  }, [])

  const openEdit = (app) => {
    setSelectedApp(null)
    setEditApp(app)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditApp(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-semibold">Applications</h3>
          <p className="text-sm text-muted-foreground">Track every application in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => exportToCSV(applications)}
            disabled={applications.length === 0}
            title="Export to CSV"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => setFormOpen(true)}>
            <Plus size={16} />
            <span className="hidden sm:inline">New Application</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Keep table mounted at all times so modals/drawers don't close on re-fetch */}
      {loading && (
        <div className="text-center py-4 text-sm text-muted-foreground">Loading…</div>
      )}
      <ApplicationTable onEdit={openEdit} onSelect={setSelectedApp} />

      <ApplicationForm
        open={formOpen}
        onClose={closeForm}
        editApp={editApp}
      />

      <ApplicationDrawer
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
        onEdit={openEdit}
      />
    </div>
  )
}
