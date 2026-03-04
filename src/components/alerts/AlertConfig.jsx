import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import useAlertStore from '@/store/alertStore'

const SOURCE_OPTIONS = [
  { value: 'indeed', label: 'Indeed (Global)' },
  { value: 'timesjobs', label: 'TimesJobs India' },
  { value: 'remotive', label: 'Remotive (Remote)' },
]

export default function AlertConfig() {
  const alerts = useAlertStore((s) => s.alerts)
  const addAlert = useAlertStore((s) => s.addAlert)
  const toggleAlert = useAlertStore((s) => s.toggleAlert)
  const deleteAlert = useAlertStore((s) => s.deleteAlert)

  const [keyword, setKeyword] = useState('')
  const [source, setSource] = useState('indeed')
  const [adding, setAdding] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!keyword.trim()) return
    setAdding(true)
    try {
      await addAlert({ keyword: keyword.trim(), source })
      toast.success(`Alert added: "${keyword.trim()}"`)
      setKeyword('')
    } catch (err) {
      toast.error(err?.message ?? 'Failed to add alert')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (alert) => {
    try {
      await toggleAlert(alert.id, !alert.active)
      toast.success(alert.active ? 'Alert paused' : 'Alert activated')
    } catch (err) {
      toast.error(err?.message ?? 'Failed to update alert')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id)
      toast.success('Alert deleted')
    } catch (err) {
      toast.error(err?.message ?? 'Failed to delete alert')
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <p className="text-sm font-semibold">Alert Configuration</p>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 items-end flex-wrap">
        <div className="space-y-1.5 flex-1 min-w-40">
          <Label className="text-xs">Keyword</Label>
          <Input
            placeholder="e.g. Senior SDET"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 w-36">
          <Label className="text-xs">Source</Label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={adding || !keyword.trim()} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
          <Plus size={15} /> Add Alert
        </Button>
      </form>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
          No alerts configured — add one above
        </p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg border bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${alert.active ? 'bg-green-500' : 'bg-muted-foreground/40'}`}
                />
                <div>
                  <span className="text-sm font-medium">{alert.keyword}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {SOURCE_OPTIONS.find((s) => s.value === alert.source)?.label ?? alert.source}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {alert.last_checked && (
                  <span className="text-xs text-muted-foreground mr-2">
                    Last: {new Date(alert.last_checked).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  title={alert.active ? 'Pause alert' : 'Activate alert'}
                  onClick={() => handleToggle(alert)}
                >
                  {alert.active
                    ? <ToggleRight size={16} className="text-green-500" />
                    : <ToggleLeft size={16} className="text-muted-foreground" />}
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(alert.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
