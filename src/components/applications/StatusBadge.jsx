import { STATUS_MAP } from '@/utils/constants'
import { cn } from '@/lib/utils'

export default function StatusBadge({ status, className }) {
  const config = STATUS_MAP[status]
  if (!config) return null
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
