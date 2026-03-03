export default function Applications() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Applications</h3>
        <button className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">
          + New Application
        </button>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">Application CRUD coming in Sprint 1.</p>
      </div>
    </div>
  )
}
