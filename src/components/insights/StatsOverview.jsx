import { TrendingUp, Briefcase, Trophy, XCircle } from 'lucide-react'

const CARDS = [
  {
    key: 'total',
    label: 'Total Applied',
    icon: Briefcase,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    key: 'active',
    label: 'Active Pipeline',
    icon: TrendingUp,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    key: 'offers',
    label: 'Offers',
    icon: Trophy,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-50 dark:bg-green-950',
  },
  {
    key: 'rejectionRate',
    label: 'Rejection Rate',
    icon: XCircle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50 dark:bg-red-950',
    suffix: '%',
  },
]

export default function StatsOverview({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, icon: Icon, iconColor, iconBg, suffix }) => (
        <div key={key} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className={`p-1.5 rounded-lg ${iconBg}`}>
              <Icon size={16} className={iconColor} />
            </div>
          </div>
          <p className="text-3xl font-bold">
            {stats?.[key] ?? 0}{suffix ?? ''}
          </p>
        </div>
      ))}
    </div>
  )
}
