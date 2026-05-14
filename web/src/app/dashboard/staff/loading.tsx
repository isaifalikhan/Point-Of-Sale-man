export default function StaffLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-slate-100 rounded mt-2"></div>
        </div>
        <div className="h-10 w-32 bg-indigo-200 rounded-lg"></div>
      </div>
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <div className="h-6 w-32 bg-slate-200 rounded"></div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
