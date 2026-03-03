import { useState, useMemo } from 'react'
import { Pencil, Trash2, ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import StatusBadge from './StatusBadge'
import { STATUS_OPTIONS, SOURCE_OPTIONS } from '@/utils/constants'
import { formatDate, daysAgo } from '@/utils/formatters'
import useApplicationStore from '@/store/applicationStore'

function SortIcon({ column, sortCol, sortDir }) {
  if (sortCol !== column) return <ChevronsUpDown size={14} className="text-muted-foreground/50" />
  return sortDir === 'asc'
    ? <ChevronUp size={14} className="text-foreground" />
    : <ChevronDown size={14} className="text-foreground" />
}

export default function ApplicationTable({ onEdit, onSelect }) {
  const { applications, deleteApplication } = useApplicationStore()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [sortCol, setSortCol] = useState('applied_date')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(col)
      setSortDir('desc')
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this application?')) return
    try {
      await deleteApplication(id)
      toast.success('Application deleted')
    } catch (err) {
      toast.error(err?.message ?? 'Failed to delete')
    }
  }

  const filtered = useMemo(() => {
    let list = [...applications]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) => a.company?.toLowerCase().includes(q) || a.role?.toLowerCase().includes(q)
      )
    }
    if (filterStatus !== 'all') list = list.filter((a) => a.status === filterStatus)
    if (filterSource !== 'all') list = list.filter((a) => a.source === filterSource)

    list.sort((a, b) => {
      let va = a[sortCol] ?? ''
      let vb = b[sortCol] ?? ''
      if (sortCol === 'applied_date') {
        va = va ? new Date(va).getTime() : 0
        vb = vb ? new Date(vb).getTime() : 0
      } else {
        va = va.toLowerCase()
        vb = vb.toLowerCase()
      }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
    return list
  }, [applications, search, filterStatus, filterSource, sortCol, sortDir])

  const SortTh = ({ col, children }) => (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground"
      onClick={() => handleSort(col)}
    >
      <span className="flex items-center gap-1">
        {children}
        <SortIcon column={col} sortCol={sortCol} sortDir={sortDir} />
      </span>
    </TableHead>
  )

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Search company or role…"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCE_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground self-center">
          {filtered.length} application{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortTh col="company">Company</SortTh>
              <SortTh col="role">Role</SortTh>
              <TableHead>Status</TableHead>
              <SortTh col="applied_date">Applied</SortTh>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  No applications yet — add your first one!
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((app) => (
                <TableRow
                  key={app.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => onSelect(app)}
                >
                  <TableCell className="font-semibold">{app.company}</TableCell>
                  <TableCell className="text-muted-foreground">{app.role}</TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(app.applied_date)}</span>
                    {app.applied_date && (
                      <span className="text-xs text-muted-foreground ml-1.5">
                        ({daysAgo(app.applied_date)})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-sm text-muted-foreground">
                    {app.source || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {app.jd_url && (
                        <Button
                          variant="ghost" size="icon"
                          onClick={(e) => { e.stopPropagation(); window.open(app.jd_url, '_blank') }}
                          title="Open JD"
                        >
                          <ExternalLink size={15} />
                        </Button>
                      )}
                      <Button
                        variant="ghost" size="icon"
                        onClick={(e) => { e.stopPropagation(); onEdit(app) }}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(e, app.id)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
