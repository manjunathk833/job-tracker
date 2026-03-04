import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ROUND_OPTIONS, INTERVIEW_STATUS_OPTIONS, DIFFICULTY_OPTIONS } from '@/utils/constants'
import { DIFFICULTY_MAP } from '@/utils/constants'
import useInterviewStore from '@/store/interviewStore'
import useApplicationStore from '@/store/applicationStore'

const EMPTY_FORM = {
  round: 'Technical-1',
  status: 'scheduled',
  scheduled_date: '',
  interviewer_name: '',
  feedback: '',
}
const EMPTY_Q = { question: '', answer: '', difficulty: 'Medium' }

function DifficultyBadge({ difficulty }) {
  const cfg = DIFFICULTY_MAP[difficulty]
  if (!cfg) return null
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

export default function InterviewForm({ open, onClose, editInterview, applicationId }) {
  const { addInterview, updateInterview } = useInterviewStore()
  const applications = useApplicationStore((s) => s.applications)
  const [form, setForm] = useState(EMPTY_FORM)
  const [questions, setQuestions] = useState([])
  const [saving, setSaving] = useState(false)
  const [pickedAppId, setPickedAppId] = useState('')

  useEffect(() => {
    if (!open) return
    setPickedAppId('')
    if (editInterview) {
      setForm({
        round: editInterview.round ?? 'Technical-1',
        status: editInterview.status ?? 'scheduled',
        scheduled_date: editInterview.scheduled_date
          ? editInterview.scheduled_date.split(' ')[0]
          : '',
        interviewer_name: editInterview.interviewer_name ?? '',
        feedback: editInterview.feedback ?? '',
      })
      const qs = editInterview.questions
      setQuestions(
        Array.isArray(qs) ? qs
          : typeof qs === 'string' ? JSON.parse(qs || '[]')
          : []
      )
    } else {
      setForm({ ...EMPTY_FORM, scheduled_date: new Date().toISOString().split('T')[0] })
      setQuestions([])
    }
  }, [open, editInterview])

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const addQuestion = () => setQuestions((q) => [...q, { ...EMPTY_Q }])
  const removeQuestion = (i) => setQuestions((q) => q.filter((_, idx) => idx !== i))
  const setQuestion = (i, field, value) =>
    setQuestions((q) => q.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const appId = editInterview?.application ?? applicationId ?? pickedAppId
    if (!appId) { toast.error('Select an application first'); return }

    setSaving(true)
    try {
      const payload = {
        ...form,
        application: appId,
        questions: JSON.stringify(questions),
      }
      if (editInterview) {
        await updateInterview(editInterview.id, payload)
        toast.success('Interview round updated')
      } else {
        await addInterview(payload)
        toast.success('Interview round added')
      }
      onClose()
    } catch (err) {
      toast.error(err?.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editInterview ? 'Edit Interview Round' : 'Add Interview Round'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <form id="interview-form" onSubmit={handleSubmit} className="space-y-4 px-1 py-2">
            {/* Application picker — only shown when opened from the top-level Add Round button */}
            {!editInterview && !applicationId && (
              <div className="space-y-1.5">
                <Label>Application</Label>
                <Select value={pickedAppId} onValueChange={setPickedAppId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an application…" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.company} — {a.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Round meta */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Round</Label>
                <Select value={form.round} onValueChange={(v) => setField('round', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROUND_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Scheduled Date</Label>
                <Input type="date" value={form.scheduled_date}
                  onChange={(e) => setField('scheduled_date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Interviewer Name</Label>
                <Input placeholder="e.g. Rahul M." value={form.interviewer_name}
                  onChange={(e) => setField('interviewer_name', e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Feedback / Notes</Label>
              <Textarea placeholder="Post-interview notes…" rows={2}
                value={form.feedback}
                onChange={(e) => setField('feedback', e.target.value)} />
            </div>

            <Separator />

            {/* Question Bank */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold">Question Bank ({questions.length})</Label>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addQuestion}>
                  <Plus size={14} /> Add Question
                </Button>
              </div>

              {questions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                  No questions yet — click "Add Question" to log interview Qs
                </p>
              )}

              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground mt-2.5 shrink-0">Q{i + 1}</span>
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Question asked…"
                            value={q.question}
                            onChange={(e) => setQuestion(i, 'question', e.target.value)}
                            className="flex-1"
                          />
                          <Select value={q.difficulty} onValueChange={(v) => setQuestion(i, 'difficulty', v)}>
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DIFFICULTY_OPTIONS.map((d) => (
                                <SelectItem key={d.value} value={d.value}>
                                  <DifficultyBadge difficulty={d.value} />
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="ghost" size="icon"
                            className="text-destructive hover:text-destructive shrink-0"
                            onClick={() => removeQuestion(i)}>
                            <Trash2 size={15} />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Your answer / approach…"
                          value={q.answer}
                          onChange={(e) => setQuestion(i, 'answer', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="interview-form" disabled={saving}>
            {saving ? 'Saving…' : editInterview ? 'Update Round' : 'Add Round'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
