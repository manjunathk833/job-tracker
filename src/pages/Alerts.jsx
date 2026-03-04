import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AlertConfig from '@/components/alerts/AlertConfig'
import JobAlertFeed from '@/components/alerts/JobAlertFeed'
import useAlertStore from '@/store/alertStore'
import { listingsSvc } from '@/services/alertService'

export default function Alerts() {
  const fetchAlerts = useAlertStore((s) => s.fetchAlerts)

  const [listings, setListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(false)

  const loadListings = async () => {
    setLoadingListings(true)
    try {
      const data = await listingsSvc.getAll()
      setListings(data)
    } catch (err) {
      toast.error(err?.message ?? 'Failed to load listings')
    } finally {
      setLoadingListings(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
    loadListings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Job Alerts</h3>
          <p className="text-sm text-muted-foreground">RSS-based SDET job feed</p>
        </div>
        <Button
          variant="outline" className="gap-2"
          disabled={loadingListings}
          onClick={loadListings}
        >
          <RefreshCw size={14} className={loadingListings ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {/* Alert config panel */}
      <AlertConfig />

      {/* Cron hint */}
      <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">To fetch new listings:</span>
        {' '}run{' '}
        <code className="bg-background border px-1.5 py-0.5 rounded">
          node scripts/job-alert-cron.js &lt;admin-email&gt; &lt;admin-password&gt;
        </code>
        {' '}in your terminal, then click Refresh above.
      </div>

      {/* Job feed */}
      {loadingListings ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading listings…</div>
      ) : (
        <JobAlertFeed listings={listings} onSaved={loadListings} />
      )}
    </div>
  )
}
