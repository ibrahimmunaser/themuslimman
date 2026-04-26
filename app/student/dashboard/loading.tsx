export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="h-8 w-48 bg-surface-raised rounded-xl animate-pulse mb-2" />
      <div className="h-4 w-32 bg-surface-raised rounded-lg animate-pulse mb-8" />
      <div className="h-28 bg-surface-raised rounded-2xl border border-border animate-pulse mb-4" />
      <div className="h-48 bg-surface-raised rounded-2xl border border-border animate-pulse" />
    </div>
  );
}
