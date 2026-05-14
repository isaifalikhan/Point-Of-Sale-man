export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      <div>
        <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
        <div className="h-4 w-56 bg-slate-100 rounded mt-2"></div>
      </div>
      <div className="bg-white rounded-xl border">
        <div className="p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-10 w-full bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
