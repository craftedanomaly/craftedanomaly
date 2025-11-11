import { VisualDesignLayout } from "@/components/projects/visual-design-layout";

interface VisualLayoutWrapperProps {
  project: any;
  media: any[];
  tags: any[];
}

export default function VisualLayoutWrapper({
  project,
  media,
  tags,
}: VisualLayoutWrapperProps) {
  return (
    <div className="fixed inset-0 z-[9999]">
      <VisualDesignLayout project={project} media={media} tags={tags} />
    </div>
  );
}
