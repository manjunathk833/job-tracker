import { useLocation } from 'react-router-dom'

const titles = {
  '/': 'Dashboard',
  '/applications': 'Applications',
  '/interviews': 'Interviews',
  '/companies': 'Companies',
  '/insights': 'Insights',
  '/alerts': 'Job Alerts',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Job Tracker'

  return (
    <header className="h-14 border-b border-border bg-background flex items-center px-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </header>
  )
}
