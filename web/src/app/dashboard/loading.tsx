import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Loading…</p>
    </div>
  );
}
