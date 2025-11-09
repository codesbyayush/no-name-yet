import LexoRank from '@kayron013/lexorank';
import type { LabelInterface } from './labels';
import type { Project } from './projects';
import type { User } from './users';

export interface Issue {
  id: string;
  board?: Board;
  issueKey?: string | null;
  title: string;
  description: string;
  // TODO: remove this once we use status directly
  status: string;
  assigneeId?: string | null;
  author?: User;
  // TODO: remove this once we use priority directly
  priority: string;
  teamId?: string;
  boardId?: string;
  createdAt: string;
  completedAt?: string;
  project?: Project;
  rank: string;
  dueDate?: string;
  tags?: LabelInterface[];
}

interface Board {
  id: string;
  name: string;
  slug: string;
}

// generates issues ranks using LexoRank algorithm.
export const ranks: string[] = [];
const generateIssuesRanks = () => {
  const firstRank = new LexoRank('a3c');
  ranks.push(firstRank.toString());
  for (let i = 1; i < 30; i++) {
    const previousRank = LexoRank.from(ranks[i - 1]);
    const currentRank = previousRank.increment();
    ranks.push(currentRank.toString());
  }
};
generateIssuesRanks();

export function groupIssuesByStatus(issues: Issue[]): Record<string, Issue[]> {
  return issues.reduce<Record<string, Issue[]>>((acc, issue) => {
    const statusId = issue.status;

    if (!acc[statusId]) {
      acc[statusId] = [];
    }

    acc[statusId].push(issue);

    return acc;
  }, {});
}

export function sortIssuesByPriority(issues: Issue[]): Issue[] {
  const priorityOrder: Record<string, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
    'no-priority': 4,
  };

  return issues
    .slice()
    .sort(
      (a, b) =>
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder],
    );
}
