export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      <div>
        <div className="h-8 w-40 bg-slate-200 rounded-lg"></div>
        <div className="h-4 w-56 bg-slate-100 rounded mt-2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-6">
            <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
            <div className="h-8 w-24 bg-slate-300 rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 h-80"></div>
        <div className="bg-white rounded-xl border p-6 h-80"></div>
      </div>
    </div>
  );
}
