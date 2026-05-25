export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
