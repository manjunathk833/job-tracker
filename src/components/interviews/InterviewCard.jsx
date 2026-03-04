import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { INTERVIEW_STATUS_MAP } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'
import QuestionBank from './QuestionBank'
import { cn } from '@/lib/utils'

function InterviewStatusBadge({ status }) {
  const cfg = INTERVIEW_STATUS_MAP[status]
  if (!cfg) return null
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

export default function InterviewCard({ interview, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const qList = (() => {
    const q = interview.questions
    if (Array.isArray(q)) return q
    if (typeof q === 'string') { try { return JSON.parse(q) } catch { return [] } }
    return []
  })()

  const handleDelete = async () => {
    if (!confirm('Delete this interview round?')) return
    try {
      await onDelete(interview.id)
      toast.success('Interview round deleted')
    } catch (err) {
      toast.error(err?.message ?? 'Failed to delete')
    }
  }

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Round pill */}
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0">
          {interview.round ?? '—'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <InterviewStatusBadge status={interview.status} />
            {interview.scheduled_date && (
              <span className="text-xs text-muted-foreground">
                {formatDate(interview.scheduled_date)}
              </span>
            )}
            {interview.interviewer_name && (
              <span className="text-xs text-muted-foreground">
                · {interview.interviewer_name}
              </span>
            )}
          </div>
          {interview.feedback && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{interview.feedback}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {qList.length > 0 && (
            <span className="text-xs text-muted-foreground mr-1">{qList.length}Q</span>
          )}
          <Button variant="ghost" size="icon" onClick={() => onEdit(interview)} title="Edit">
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete} title="Delete">
            <Trash2 size={14} />
          </Button>
          <Button
            variant="ghost" size="icon"
            onClick={() => setExpanded((e) => !e)}
            title={expanded ? 'Collapse' : 'Expand questions'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </div>
      </div>

      {/* Expanded questions */}
      {expanded && (
        <>
          <Separator />
          <div className="px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Question Bank
            </p>
            <QuestionBank questions={interview.questions} />
          </div>
        </>
      )}
    </div>
  )
}
