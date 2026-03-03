import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ApplicationForm from '@/components/applications/ApplicationForm'
import ApplicationTable from '@/components/applications/ApplicationTable'
import ApplicationDrawer from '@/components/applications/ApplicationDrawer'
import useApplicationStore from '@/store/applicationStore'

export default function Applications() {
  // Select only what we need — stable function reference from store
  const fetchApplications = useApplicationStore((s) => s.fetchApplications)
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Applications</h3>
          <p className="text-sm text-muted-foreground">Track every application in one place</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          New Application
        </Button>
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
