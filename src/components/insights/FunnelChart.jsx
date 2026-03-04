import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

export default function FunnelChart({ data }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold mb-4">Application Funnel</p>
      {data.every((d) => d.count === 0) ? (
        <p className="text-sm text-muted-foreground text-center py-16">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(v) => [v, 'Applications']}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
