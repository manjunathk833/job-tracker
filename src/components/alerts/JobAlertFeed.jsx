import { useState } from 'react'
import { toast } from 'sonner'
import { ExternalLink, Bookmark, BookmarkCheck, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { listingsSvc } from '@/services/alertService'
import useApplicationStore from '@/store/applicationStore'

export default function JobAlertFeed({ listings, onSaved }) {
  const addApplication = useApplicationStore((s) => s.addApplication)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(null) // listing id being saved

  const filtered = listings.filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.title.toLowerCase().includes(q) ||
      (l.company ?? '').toLowerCase().includes(q)
    )
  })

  const handleSave = async (listing) => {
    setSaving(listing.id)
    try {
      await addApplication({
        company: listing.company || 'Unknown',
        role: listing.title,
        status: 'applied',
        source: 'alert',
        jd_url: listing.link,
        applied_date: new Date().toISOString().split('T')[0],
        notes: listing.description || '',
      })
      await listingsSvc.markSaved(listing.id)
      toast.success(`Saved "${listing.title}" as application`)
      onSaved?.()
    } catch (err) {
      toast.error(err?.message ?? 'Failed to save application')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 p-4 border-b">
        <p className="text-sm font-semibold flex-1">
          Job Feed
          <span className="text-muted-foreground font-normal ml-2">({filtered.length} listing{filtered.length !== 1 ? 's' : ''})</span>
        </p>
        <div className="relative w-56">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter listings…"
            className="pl-8 h-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-muted-foreground text-sm">No listings yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Run the cron script to fetch jobs:
          </p>
          <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
            node scripts/job-alert-cron.js &lt;email&gt; &lt;password&gt;
          </code>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No listings match your filter.</p>
      ) : (
        <div className="divide-y">
          {filtered.map((listing) => (
            <div key={listing.id} className="flex items-start gap-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{listing.title}</p>
                    {listing.company && (
                      <p className="text-xs text-muted-foreground">{listing.company}</p>
                    )}
                  </div>
                  {listing.saved && (
                    <span className="text-xs text-green-600 bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded-full border border-green-200 shrink-0">
                      Saved
                    </span>
                  )}
                </div>
                {listing.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {listing.description}
                  </p>
                )}
                {listing.published_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(listing.published_date).toLocaleDateString('en-IN', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button
                  variant="outline" size="sm" className="h-7 gap-1 text-xs"
                  onClick={() => window.open(listing.link, '_blank')}
                >
                  <ExternalLink size={12} /> View
                </Button>
                {listing.saved ? (
                  <Button
                    variant="ghost" size="sm" className="h-7 gap-1 text-xs text-green-600"
                    disabled
                  >
                    <BookmarkCheck size={12} /> Saved
                  </Button>
                ) : (
                  <Button
                    variant="default" size="sm"
                    className="h-7 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700"
                    disabled={saving === listing.id}
                    onClick={() => handleSave(listing)}
                  >
                    <Bookmark size={12} />
                    {saving === listing.id ? 'Saving…' : 'Save'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
