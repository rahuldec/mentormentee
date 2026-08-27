export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <div className="text-2xl font-semibold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
