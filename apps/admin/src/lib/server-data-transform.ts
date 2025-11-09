import LexoRank from '@kayron013/lexorank';
import type { Issue } from '@/mock-data/issues';

// Generate ranks for issues
const generateRank = (index: number) => {
  const firstRank = new LexoRank('a3c');
  for (let i = 0; i < index; i++) {
    const _previousRank = LexoRank.from(firstRank.toString());
    firstRank.increment();
  }
  return firstRank.toString();
};

// Transform server post data to client Issue format
type ServerTag = { id: string; name: string; color: string };
type ServerPost = {
  id: string;
  title: string;
  issueKey?: string | null;
  description: string;
  status: string;
  priority: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  assigneeAvatarUrl?: string | null;
  tags?: ServerTag[];
  completedAt?: string | Date | null;
  createdAt?: string | Date | null;
  dueDate?: string | Date | null;
};

export const transformServerPostToIssue = (
  serverPost: ServerPost,
  index: number,
): Issue => {
  // Map server data to client format
  const clientIssue: Issue = {
    ...serverPost,
    issueKey: serverPost.issueKey || undefined,
    status: serverPost.status,
    assigneeId: serverPost.assigneeId || undefined,
    priority: serverPost.priority,
    completedAt: serverPost.completedAt
      ? new Date(serverPost.completedAt).toISOString().split('T')[0]
      : undefined,
    createdAt: serverPost.createdAt
      ? new Date(serverPost.createdAt).toISOString().split('T')[0]
      : '2025-01-01',
    rank: generateRank(index),
    dueDate: serverPost.dueDate
      ? new Date(serverPost.dueDate).toISOString().split('T')[0]
      : undefined,
    tags: serverPost.tags,
  };

  return clientIssue;
};

// Transform multiple server posts to client issues
export const transformServerPostsToIssues = (
  serverPosts: ServerPost[],
): Issue[] =>
  serverPosts.map((post, index) => transformServerPostToIssue(post, index));
