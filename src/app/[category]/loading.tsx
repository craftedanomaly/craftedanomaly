import { ProjectGridLoading } from '@/components/projects/project-card-loading';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Loading */}
        <div className="mb-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Filter Controls Loading */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Projects Grid Loading */}
        <ProjectGridLoading count={9} />
      </div>
    </div>
  );
}
