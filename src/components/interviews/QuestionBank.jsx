import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { DIFFICULTY_MAP } from '@/utils/constants'
import { cn } from '@/lib/utils'

function DifficultyBadge({ difficulty }) {
  const cfg = DIFFICULTY_MAP[difficulty]
  if (!cfg) return null
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function QuestionRow({ q, index }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="text-xs text-muted-foreground mt-0.5 shrink-0 w-5">Q{index + 1}</span>
        <span className="flex-1 text-sm font-medium">{q.question || '(untitled question)'}</span>
        <div className="flex items-center gap-2 shrink-0">
          <DifficultyBadge difficulty={q.difficulty} />
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {expanded && q.answer && (
        <div className="px-4 pb-3 pt-1 bg-muted/20 border-t">
          <p className="text-xs text-muted-foreground mb-1">Answer / Approach</p>
          <p className="text-sm whitespace-pre-wrap">{q.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function QuestionBank({ questions, className }) {
  const list = Array.isArray(questions) ? questions
    : typeof questions === 'string' ? (() => { try { return JSON.parse(questions) } catch { return [] } })()
    : []

  if (!list.length) {
    return (
      <p className={cn('text-sm text-muted-foreground italic', className)}>
        No questions logged for this round.
      </p>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {list.map((q, i) => (
        <QuestionRow key={i} q={q} index={i} />
      ))}
    </div>
  )
}
