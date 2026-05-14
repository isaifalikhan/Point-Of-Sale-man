import { Loader2 } from 'lucide-react';

export default function KDSLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-56 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-100 rounded mt-2"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 h-48">
            <div className="h-5 w-24 bg-slate-200 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded"></div>
              <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
