export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="h-8 w-40 bg-surface-raised rounded-xl animate-pulse mb-6" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-surface-raised rounded-2xl border border-border animate-pulse" />
        ))}
      </div>
    </div>
  );
}
