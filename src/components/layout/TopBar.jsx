import { useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { Sun, Moon, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

const titles = {
  '/': 'Dashboard',
  '/applications': 'Applications',
  '/interviews': 'Interviews',
  '/companies': 'Companies',
  '/insights': 'Insights',
  '/alerts': 'Job Alerts',
}

export default function TopBar({ onMenuClick }) {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Job Tracker'
  const { theme, setTheme } = useTheme()

  return (
    <header className="h-14 border-b border-border bg-background flex items-center px-4 gap-3">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu size={20} />
      </Button>

      <h2 className="text-lg font-semibold text-foreground flex-1">{title}</h2>

      {/* Cmd+K search hint */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
        className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md px-3 py-1.5 hover:bg-accent transition-colors"
      >
        <Search size={14} />
        <span>Search…</span>
        <kbd className="text-xs bg-muted rounded px-1 py-0.5 font-mono">⌘K</kbd>
      </button>

      {/* Dark mode toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title="Toggle dark mode"
      >
        <Sun size={18} className="hidden dark:block" />
        <Moon size={18} className="dark:hidden" />
      </Button>
    </header>
  )
}
