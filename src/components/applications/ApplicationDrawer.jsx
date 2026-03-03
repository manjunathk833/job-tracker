import { useState, useEffect } from 'react'
import { ExternalLink, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import StatusBadge from './StatusBadge'
import InterviewCard from '@/components/interviews/InterviewCard'
import InterviewForm from '@/components/interviews/InterviewForm'
import { formatDate, daysAgo } from '@/utils/formatters'
import { SOURCE_MAP } from '@/utils/constants'
import useApplicationStore from '@/store/applicationStore'
import useInterviewStore from '@/store/interviewStore'
import * as interviewSvc from '@/services/interviewService'

function Field({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

export default function ApplicationDrawer({ app, onClose, onEdit }) {
  const { deleteApplication } = useApplicationStore()
  const { deleteInterview } = useInterviewStore()

  const [interviews, setInterviews] = useState([])
  const [interviewFormOpen, setInterviewFormOpen] = useState(false)
  const [editInterview, setEditInterview] = useState(null)

  useEffect(() => {
    if (!app) { setInterviews([]); return }
    interviewSvc.getByApplication(app.id)
      .then(setInterviews)
      .catch(() => setInterviews([]))
  }, [app?.id])

  const refreshInterviews = () => {
    if (!app) return
    interviewSvc.getByApplication(app.id).then(setInterviews).catch(() => {})
  }

  const handleDeleteApp = async () => {
    if (!confirm('Delete this application?')) return
    try {
      await deleteApplication(app.id)
      toast.success('Application deleted')
      onClose()
    } catch (err) {
      toast.error(err?.message ?? 'Failed to delete')
    }
  }

  const handleDeleteInterview = async (id) => {
    await deleteInterview(id)
    setInterviews((list) => list.filter((i) => i.id !== id))
  }

  const openAddInterview = () => { setEditInterview(null); setInterviewFormOpen(true) }
  const openEditInterview = (iv) => { setEditInterview(iv); setInterviewFormOpen(true) }
  const closeInterviewForm = () => {
    setInterviewFormOpen(false)
    setEditInterview(null)
    refreshInterviews()
  }

  if (!app) return null

  return (
    <>
      <Sheet open={!!app} onOpenChange={(v) => !v && onClose()}>
        <SheetContent className="w-[460px] sm:max-w-[460px] p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-start justify-between gap-2">
              <div>
                <SheetTitle className="text-lg">{app.company}</SheetTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{app.role}</p>
              </div>
              <StatusBadge status={app.status} className="mt-1 shrink-0" />
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Applied"
                  value={app.applied_date
                    ? `${formatDate(app.applied_date)} (${daysAgo(app.applied_date)})`
                    : null}
                />
                <Field label="Source" value={SOURCE_MAP[app.source]?.label ?? app.source} />
                <Field label="Location" value={app.location} />
                <Field label="Salary Range" value={app.salary_range} />
                <Field label="Resume Version" value={app.resume_version} />
              </div>

              {app.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{app.notes}</p>
                  </div>
                </>
              )}

              {app.jd_url && (
                <>
                  <Separator />
                  <a
                    href={app.jd_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                  >
                    <ExternalLink size={14} /> View Job Description
                  </a>
                </>
              )}

              {/* Interview Timeline */}
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold">
                    Interview Rounds
                    <span className="text-muted-foreground font-normal ml-1.5">({interviews.length})</span>
                  </p>
                  <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={openAddInterview}>
                    <Plus size={13} /> Add Round
                  </Button>
                </div>

                {interviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No interview rounds yet. Click "Add Round" to log one.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {interviews.map((iv) => (
                      <InterviewCard
                        key={iv.id}
                        interview={iv}
                        onEdit={openEditInterview}
                        onDelete={handleDeleteInterview}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <div className="px-6 py-4 border-t flex gap-2">
            <Button className="flex-1 gap-2" onClick={() => onEdit(app)}>
              <Pencil size={15} /> Edit Application
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDeleteApp} title="Delete">
              <Trash2 size={15} />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <InterviewForm
        open={interviewFormOpen}
        onClose={closeInterviewForm}
        editInterview={editInterview}
        applicationId={app?.id}
      />
    </>
  )
}
