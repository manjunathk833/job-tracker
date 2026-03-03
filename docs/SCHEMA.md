# PocketBase Collections Schema

## applications
| Field | Type | Options |
|-------|------|---------|
| company | text (required) | |
| role | text (required) | |
| status | select | applied, screening, interview, offer, rejected, ghosted |
| applied_date | date | |
| source | text | linkedin, naukri, direct, referral, alert |
| jd_url | url | |
| resume_version | text | e.g. v3-sdet-maang |
| notes | text | |
| salary_range | text | e.g. 30-40 LPA |
| location | text | e.g. Bengaluru / Remote |

## interviews
| Field | Type | Options |
|-------|------|---------|
| application | relation → applications | |
| round | text | HR, Technical-1, Technical-2, System-Design, Final |
| scheduled_date | date | |
| status | select | scheduled, completed, cancelled |
| feedback | text | |
| questions | json | [{question, answer, difficulty: Easy/Medium/Hard}] |
| interviewer_name | text | |

## companies
| Field | Type | Options |
|-------|------|---------|
| name | text (required) | |
| tier | select | MAANG, Tier-1, Tier-2, Startup |
| website | url | |
| glassdoor_url | url | |
| notes | text | |
| tags | json | string[] |

## alerts
| Field | Type | Options |
|-------|------|---------|
| keyword | text | e.g. Senior SDET |
| source | text | linkedin, naukri, indeed |
| last_checked | date | |
| active | bool | |
