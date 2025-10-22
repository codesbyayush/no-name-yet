import { LexoRank } from '@/lib/utils';
import type { Issue } from '@/mock-data/issues';
import { labels } from '@/mock-data/labels';
import { priorities } from '@/mock-data/priorities';
import { projects } from '@/mock-data/projects';
import { status } from '@/mock-data/status';

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
export const transformServerPostToIssue = (
  serverPost: any,
  index: number
): Issue => {
  // Map server data to client format
  const clientIssue: Issue = {
    ...serverPost,
    status: status.find((s) => s.id === serverPost.status) || status[5],
    statusKey: serverPost.status,
    assignee: serverPost.assigneeId
      ? {
          id: serverPost.assigneeId,
          name: serverPost.assigneeName || 'Unknown User',
          email: serverPost.assigneeEmail || 'unknown@example.com',
          avatarUrl:
            serverPost.assigneeImage ||
            `https://api.dicebear.com/9.x/glass/svg?seed=${serverPost.assigneeId}`,
          status: 'online' as const,
          role: 'Member' as const,
          joinedDate: new Date().toISOString().split('T')[0],
          teamIds: [],
        }
      : null,
    assigneeId: serverPost.assigneeId || undefined,
    priorityKey: serverPost.priority,
    priority:
      priorities.find((p) => p.id === serverPost.priority) || priorities[4],
    tags: serverPost.tags?.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
    })) || [labels[0]], // Default to first label
    createdAt: serverPost.createdAt
      ? new Date(serverPost.createdAt).toISOString().split('T')[0]
      : '2025-01-01',
    project: projects[index % projects.length],
    rank: generateRank(index),
    dueDate: serverPost.dueDate
      ? new Date(serverPost.dueDate).toISOString().split('T')[0]
      : undefined,
  };

  return clientIssue;
};

// Transform multiple server posts to client issues
export const transformServerPostsToIssues = (serverPosts: any[]): Issue[] =>
  serverPosts.map((post, index) => transformServerPostToIssue(post, index));
