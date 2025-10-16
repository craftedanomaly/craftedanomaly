import { Skeleton } from "@/components/ui/skeleton";

export function HeroCarouselLoading() {
  return (
    <div className="relative h-[70vh] lg:h-[80vh] w-full overflow-hidden">
      {/* Main image skeleton */}
      <Skeleton className="absolute inset-0 w-full h-full" />
      
      {/* Navigation dots skeleton */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="w-3 h-3 rounded-full" />
        ))}
      </div>
      
      {/* Navigation arrows skeleton */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      
      {/* Content skeleton */}
      <div className="absolute bottom-8 left-8 right-8">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-6" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Play button skeleton (for videos) */}
      <div className="absolute top-4 right-4">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    </div>
  );
}
