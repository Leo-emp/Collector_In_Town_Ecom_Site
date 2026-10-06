export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-surface rounded-xl animate-pulse" />
        <div className="space-y-4 py-4">
          <div className="h-6 w-3/4 bg-surface rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-surface rounded animate-pulse" />
          <div className="h-8 w-1/3 bg-surface rounded animate-pulse mt-4" />
          <div className="h-12 w-full bg-surface rounded-lg animate-pulse mt-8" />
        </div>
      </div>
    </div>
  );
}
