import { Loader2 } from 'lucide-react';

export default function InventoryLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-56 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-100 rounded mt-2"></div>
        </div>
        <div className="h-10 w-28 bg-indigo-200 rounded-lg"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-6">
            <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
            <div className="h-8 w-16 bg-slate-300 rounded"></div>
          </div>
        ))}
      </div>
      <div className="h-12 bg-white rounded-xl border"></div>
      <div className="bg-white rounded-xl border p-6">
        <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
