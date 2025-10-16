import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Loading */}
      <div className="relative h-[60vh] lg:h-[70vh] overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" />
        
        {/* Back Button Loading */}
        <div className="absolute top-8 left-8 z-10">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        
        {/* Hero Content Loading */}
        <div className="absolute bottom-8 left-8 right-8 z-10">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>

      {/* Content Section Loading */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content Loading */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Loading */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Gallery Loading */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square w-full rounded-lg" />
                ))}
              </div>
            </div>

            {/* Before/After Loading */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="aspect-video w-full rounded-lg" />
            </div>
          </div>

          {/* Sidebar Loading */}
          <div className="space-y-6">
            {/* Project Info Loading */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-18" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>

            {/* Tags Loading */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-16" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>

            {/* Related Projects Loading */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <Skeleton className="w-16 h-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
