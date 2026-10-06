export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-8 w-48 bg-surface rounded animate-pulse mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden">
            <div className="aspect-square bg-surface animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 bg-surface rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-surface rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
