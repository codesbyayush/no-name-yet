import { Link } from '@tanstack/react-router';
import { Badge } from '@workspace/ui/components/badge';
import type { Project } from '@/mock-data/projects';

export function ProjectBadge({ project }: { project: Project }) {
  return (
    <Link
      className='flex items-center justify-center gap-.5'
      to='/admin/projects/all'
    >
      <Badge
        className='gap-1.5 rounded-full bg-background text-muted-foreground'
        variant='outline'
      >
        <project.icon size={16} />
        {project.name}
      </Badge>
    </Link>
  );
}
