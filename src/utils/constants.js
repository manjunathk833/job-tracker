export const STATUS_OPTIONS = [
  { value: 'applied',    label: 'Applied',    color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'screening',  label: 'Screening',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'interview',  label: 'Interview',  color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'offer',      label: 'Offer',      color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'rejected',   label: 'Rejected',   color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'ghosted',    label: 'Ghosted',    color: 'bg-gray-100 text-gray-600 border-gray-200' },
]

export const SOURCE_OPTIONS = [
  { value: 'linkedin',  label: 'LinkedIn' },
  { value: 'naukri',   label: 'Naukri' },
  { value: 'direct',   label: 'Direct' },
  { value: 'referral', label: 'Referral' },
  { value: 'alert',    label: 'Alert' },
]

export const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]))
export const SOURCE_MAP = Object.fromEntries(SOURCE_OPTIONS.map(s => [s.value, s]))
