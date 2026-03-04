import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Calendar, Building2, BarChart3, Bell } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/interviews', label: 'Interviews', icon: Calendar },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/alerts', label: 'Alerts', icon: Bell },
]

export default function MobileSidebar({ open, onClose }) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className="p-0 w-60" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-white font-bold text-lg tracking-tight">
            <span className="text-indigo-400">Job</span> Tracker
          </h1>
          <p className="text-white/40 text-xs mt-0.5">MAANG Hunt</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 mt-auto">
          <p className="text-white/30 text-xs">Manjunath H K</p>
          <p className="text-white/20 text-xs">Senior SDET</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
