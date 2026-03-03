export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Welcome back 👋</h3>
        <p className="text-muted-foreground mt-1">Your MAANG job hunt at a glance</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {['Applied', 'In Pipeline', 'Offers', 'Rejections'].map((label) => (
          <div key={label} className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">—</p>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-sm">Charts and insights will appear here in Sprint 3.</p>
    </div>
  )
}
