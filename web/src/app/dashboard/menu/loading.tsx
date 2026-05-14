import { Loader2 } from 'lucide-react';

export default function MenuLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-slate-100 rounded mt-2"></div>
        </div>
        <div className="h-10 w-32 bg-indigo-200 rounded-lg"></div>
      </div>
      <div className="h-12 bg-white rounded-xl border"></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden">
            <div className="h-48 bg-slate-100"></div>
            <div className="p-4 space-y-2">
              <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
              <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
