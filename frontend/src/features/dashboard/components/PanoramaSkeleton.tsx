import { Skeleton } from '@/shared/components/ui/skeleton'

export function PanoramaSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/70 bg-card p-3.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-3 h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <Skeleton className="h-72 rounded-xl lg:col-span-7" />
        <Skeleton className="h-72 rounded-xl lg:col-span-5" />
        <Skeleton className="h-64 rounded-xl lg:col-span-12" />
        <Skeleton className="h-64 rounded-xl lg:col-span-6" />
        <Skeleton className="h-64 rounded-xl lg:col-span-6" />
      </div>
    </div>
  )
}
