import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Briefcase, Calendar, BarChart3, Bell, LayoutDashboard, Building2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import useApplicationStore from '@/store/applicationStore'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Applications', to: '/applications', icon: Briefcase },
  { label: 'Interviews', to: '/interviews', icon: Calendar },
  { label: 'Companies', to: '/companies', icon: Building2 },
  { label: 'Insights', to: '/insights', icon: BarChart3 },
  { label: 'Alerts', to: '/alerts', icon: Bell },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const applications = useApplicationStore((s) => s.applications)

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    const custom = () => setOpen(true)
    window.addEventListener('keydown', down)
    window.addEventListener('open-command-palette', custom)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('open-command-palette', custom)
    }
  }, [])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const q = query.toLowerCase()
  const appResults = q.length < 1 ? [] : applications
    .filter((a) =>
      a.company?.toLowerCase().includes(q) ||
      a.role?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q)
    )
    .slice(0, 5)
    .map((a) => ({
      label: `${a.company} — ${a.role}`,
      sub: a.status,
      icon: Briefcase,
      action: () => navigate('/applications'),
    }))

  const navResults = NAV_ITEMS.filter((n) =>
    q.length === 0 || n.label.toLowerCase().includes(q)
  ).map((n) => ({
    label: n.label,
    icon: n.icon,
    action: () => navigate(n.to),
  }))

  const results = q.length > 0
    ? [...appResults, ...navResults]
    : navResults

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selected]) {
          results[selected].action()
          setOpen(false)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, results, selected])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 max-w-lg overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
            placeholder="Search apps, pages…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono text-muted-foreground">ESC</kbd>
        </div>

        {/* Results */}
        <div className="py-2 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No results found</p>
          ) : (
            results.map((r, i) => {
              const Icon = r.icon
              return (
                <button
                  key={i}
                  onClick={() => { r.action(); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    i === selected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                  }`}
                >
                  <Icon size={15} className="text-muted-foreground shrink-0" />
                  <span className="flex-1">{r.label}</span>
                  {r.sub && (
                    <span className="text-xs text-muted-foreground capitalize">{r.sub}</span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t flex gap-4 text-xs text-muted-foreground">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">ESC</kbd> close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
