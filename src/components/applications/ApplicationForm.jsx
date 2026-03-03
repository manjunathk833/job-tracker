import { useState, useEffect } from 'react'
import { toast } from 'sonner'
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
import { STATUS_OPTIONS, SOURCE_OPTIONS } from '@/utils/constants'
import { parseCompanyFromUrl } from '@/utils/formatters'
import useApplicationStore from '@/store/applicationStore'

const EMPTY = {
  company: '', role: '', status: 'applied', applied_date: '',
  source: '', jd_url: '', resume_version: '', notes: '',
  salary_range: '', location: '',
}

export default function ApplicationForm({ open, onClose, editApp }) {
  const { addApplication, updateApplication } = useApplicationStore()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editApp) {
      setForm({
        company: editApp.company ?? '',
        role: editApp.role ?? '',
        status: editApp.status ?? 'applied',
        applied_date: editApp.applied_date ? editApp.applied_date.split(' ')[0] : '',
        source: editApp.source ?? '',
        jd_url: editApp.jd_url ?? '',
        resume_version: editApp.resume_version ?? '',
        notes: editApp.notes ?? '',
        salary_range: editApp.salary_range ?? '',
        location: editApp.location ?? '',
      })
    } else {
      setForm({ ...EMPTY, applied_date: new Date().toISOString().split('T')[0] })
    }
  }, [editApp, open])

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleUrlBlur = () => {
    if (form.jd_url && !form.company) {
      const company = parseCompanyFromUrl(form.jd_url)
      if (company) set('company', company)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.role.trim()) {
      toast.error('Company and Role are required')
      return
    }
    setSaving(true)
    try {
      if (editApp) {
        await updateApplication(editApp.id, form)
        toast.success('Application updated')
      } else {
        await addApplication(form)
        toast.success('Application added')
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editApp ? 'Edit Application' : 'New Application'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* JD URL — first for quick-add */}
          <div className="space-y-1.5">
            <Label>JD URL</Label>
            <Input
              placeholder="Paste job URL — company name auto-fills"
              value={form.jd_url}
              onChange={(e) => set('jd_url', e.target.value)}
              onBlur={handleUrlBlur}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Company *</Label>
              <Input
                placeholder="e.g. Google"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Input
                placeholder="e.g. Senior SDET"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => set('source', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Applied Date</Label>
              <Input
                type="date"
                value={form.applied_date}
                onChange={(e) => set('applied_date', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                placeholder="e.g. Bengaluru / Remote"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Salary Range</Label>
              <Input
                placeholder="e.g. 30-40 LPA"
                value={form.salary_range}
                onChange={(e) => set('salary_range', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Resume Version</Label>
              <Input
                placeholder="e.g. v3-sdet-maang"
                value={form.resume_version}
                onChange={(e) => set('resume_version', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any notes about this application..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editApp ? 'Update' : 'Add Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
