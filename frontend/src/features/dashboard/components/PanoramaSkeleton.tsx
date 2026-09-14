import { Skeleton } from '@/shared/components/ui/skeleton'

export function PanoramaSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-lg" />

      <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Skeleton className="h-72 rounded-lg lg:col-span-8" />
        <Skeleton className="h-72 rounded-lg lg:col-span-4" />
        <Skeleton className="h-64 rounded-lg lg:col-span-6" />
        <Skeleton className="h-64 rounded-lg lg:col-span-6" />
        <Skeleton className="h-52 rounded-lg lg:col-span-12" />
      </div>
    </div>
  )
}
