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

export const ROUND_OPTIONS = [
  { value: 'HR',            label: 'HR' },
  { value: 'Technical-1',  label: 'Technical-1' },
  { value: 'Technical-2',  label: 'Technical-2' },
  { value: 'System-Design', label: 'System Design' },
  { value: 'Bar-Raiser',   label: 'Bar Raiser' },
  { value: 'Final',        label: 'Final' },
]

export const INTERVIEW_STATUS_OPTIONS = [
  { value: 'scheduled',  label: 'Scheduled',  color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'completed',  label: 'Completed',  color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'cancelled',  label: 'Cancelled',  color: 'bg-gray-100 text-gray-600 border-gray-200' },
]

export const DIFFICULTY_OPTIONS = [
  { value: 'Easy',   label: 'Easy',   color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'Hard',   label: 'Hard',   color: 'bg-red-100 text-red-700 border-red-200' },
]

export const INTERVIEW_STATUS_MAP = Object.fromEntries(INTERVIEW_STATUS_OPTIONS.map(s => [s.value, s]))
export const DIFFICULTY_MAP = Object.fromEntries(DIFFICULTY_OPTIONS.map(s => [s.value, s]))
