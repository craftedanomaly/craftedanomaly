import { Skeleton } from "@/components/ui/skeleton";

export function FieldAccordionLoading() {
  return (
    <div className="w-full h-[72vh] flex gap-0">
      {/* Generate 5 category skeletons */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex-1 relative overflow-hidden">
          {/* Background image skeleton */}
          <Skeleton className="absolute inset-0 w-full h-full" />
          
          {/* Bottom content skeleton */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* Category name skeleton */}
            <Skeleton className="h-6 w-3/4 mb-3" />
            
            {/* Project count badge skeleton */}
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          
          {/* Gradient overlay skeleton */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        </div>
      ))}
    </div>
  );
}
