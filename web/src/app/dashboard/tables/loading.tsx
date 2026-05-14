import { Loader2 } from 'lucide-react';

export default function TablesLoading() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-pulse">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border">
        <div>
          <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-3 w-56 bg-slate-100 rounded mt-2"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
          <div className="h-10 w-28 bg-indigo-200 rounded-lg"></div>
        </div>
      </div>
      <div className="flex gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
            <div className="h-3 w-16 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
      <div className="bg-slate-50 rounded-3xl border-2 border-dashed min-h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    </div>
  );
}
