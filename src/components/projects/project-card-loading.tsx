import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardLoading() {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card">
      {/* Image skeleton */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" />
        
        {/* View count skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        
        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProjectGridLoading({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProjectCardLoading key={index} />
      ))}
    </div>
  );
}
