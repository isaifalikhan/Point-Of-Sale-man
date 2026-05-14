'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const POSClient = dynamic(() => import('./pos-client'), {
  loading: () => (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading POS…</p>
    </div>
  ),
  ssr: false,
});

export default function POSPage() {
  return <POSClient />;
}
