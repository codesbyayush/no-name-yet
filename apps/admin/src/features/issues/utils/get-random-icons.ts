import { Box } from 'lucide-react';
import { projects } from '@/mock-data/projects';

// Deterministically pick an icon from mock projects for a given id
export function pickIconForId(id: string) {
  const icons = projects.map((p) => p.icon);
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = Math.imul(hash, 31) + id.charCodeAt(i);
  }
  const index = ((hash % icons.length) + icons.length) % icons.length;
  return icons[index] ?? Box;
}
