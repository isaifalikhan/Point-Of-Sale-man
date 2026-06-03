export default function HistoryLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
      <div>
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="h-4 w-72 bg-slate-100 rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 h-20" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border h-24" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border h-24" />
        ))}
      </div>
    </div>
  );
}
