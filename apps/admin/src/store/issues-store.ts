import { create } from 'zustand';
import { groupIssuesByStatus, type Issue } from '@/mock-data/issues';
import type { LabelInterface } from '@/mock-data/labels';
import type { Priority } from '@/mock-data/priorities';
import type { Project } from '@/mock-data/projects';
import type { Status } from '@/mock-data/status';
import type { User } from '@/store/users-store';

interface FilterOptions {
  status?: string[];
  assignee?: string[];
  priority?: string[];
  labels?: string[];
  project?: string[];
}

interface IssuesState {
  // Data
  issues: Issue[];
  issuesByStatus: Record<string, Issue[]>;

  //
  getAllIssues: () => Issue[];

  // Actions
  addIssue: (issue: Issue) => void;
  addIssues: (issues: Issue[]) => void;
  updateIssue: (id: string, updatedIssue: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;

  // Filters
  filterByStatus: (statusId: string) => Issue[];
  filterByPriority: (priorityId: string) => Issue[];
  filterByAssignee: (userId: string | null) => Issue[];
  filterByLabel: (labelId: string) => Issue[];
  filterByProject: (projectId: string) => Issue[];
  searchIssues: (query: string) => Issue[];
  filterIssues: (filters: FilterOptions) => Issue[];

  // Status management
  updateIssueStatus: (issueId: string, newStatus: string) => void;

  // Priority management
  updateIssuePriority: (issueId: string, newPriority: string) => void;

  // Assignee management
  updateIssueAssignee: (issueId: string, newAssignee: User | null) => void;

  // Labels management
  addIssueLabel: (issueId: string, label: LabelInterface) => void;
  removeIssueLabel: (issueId: string, labelId: string) => void;

  // Project management
  updateIssueProject: (
    issueId: string,
    newProject: Project | undefined,
  ) => void;

  // Utility functions
  getIssueById: (id: string) => Issue | undefined;
}

export const useIssuesStore = create<IssuesState>((set, get) => ({
  // Initial state
  // issues: mockIssues.sort((a, b) => b.rank.localeCompare(a.rank)),
  issues: [],
  issuesByStatus: {},

  //
  getAllIssues: () => get().issues,

  // Actions
  addIssue: (issue: Issue) => {
    set((state) => {
      const newIssues = [...state.issues, issue];
      return {
        issues: newIssues,
        issuesByStatus: groupIssuesByStatus(newIssues),
      };
    });
  },

  addIssues: (newIssues: Issue[]) => {
    set((state) => {
      // Merge new issues with existing ones, avoiding duplicates by ID
      const existingIds = new Set(state.issues.map((issue) => issue.id));
      const uniqueNewIssues = newIssues.filter(
        (issue) => !existingIds.has(issue.id),
      );
      const allIssues = [...state.issues, ...uniqueNewIssues].sort((a, b) =>
        b.rank.localeCompare(a.rank),
      );

      return {
        issues: allIssues,
        issuesByStatus: groupIssuesByStatus(allIssues),
      };
    });
  },

  updateIssue: (id: string, updatedIssue: Partial<Issue>) => {
    set((state) => {
      const newIssues = state.issues.map((issue) =>
        issue.id === id ? { ...issue, ...updatedIssue } : issue,
      );

      return {
        issues: newIssues,
        issuesByStatus: groupIssuesByStatus(newIssues),
      };
    });
  },

  deleteIssue: (id: string) => {
    set((state) => {
      const newIssues = state.issues.filter((issue) => issue.id !== id);
      return {
        issues: newIssues,
        issuesByStatus: groupIssuesByStatus(newIssues),
      };
    });
  },

  // Filters
  filterByStatus: (statusId: string) =>
    get().issues.filter((issue) => issue.status === statusId),

  filterByPriority: (priorityId: string) =>
    get().issues.filter((issue) => issue.priority === priorityId),

  filterByAssignee: (userId: string | null) => {
    if (userId === null) {
      return get().issues.filter((issue) => issue.assignee === null);
    }
    return get().issues.filter((issue) => issue.assignee?.id === userId);
  },

  filterByLabel: (labelId: string) =>
    get().issues.filter((issue) =>
      issue.tags?.some((label) => label.id === labelId),
    ),

  filterByProject: (projectId: string) =>
    get().issues.filter((issue) => issue.project?.id === projectId),

  searchIssues: (query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    return get().issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(lowerCaseQuery) ||
        issue.issueKey?.toLowerCase().includes(lowerCaseQuery),
    );
  },

  filterIssues: (filters: FilterOptions) => {
    let filteredIssues = get().issues;

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filteredIssues = filteredIssues.filter((issue) =>
        filters.status?.includes(issue.status),
      );
    }

    // Filter by assignee
    if (filters.assignee && filters.assignee.length > 0) {
      filteredIssues = filteredIssues.filter(
        (issue) =>
          (filters.assignee?.includes('unassigned') &&
            issue.assignee === null) ||
          (!!issue.assignee && filters.assignee?.includes(issue.assignee.id)),
      );
    }

    // Filter by priority
    if (filters.priority && filters.priority.length > 0) {
      filteredIssues = filteredIssues.filter((issue) =>
        filters.priority?.includes(issue.priority),
      );
    }

    // Filter by labels
    if (filters.labels && filters.labels.length > 0) {
      filteredIssues = filteredIssues.filter((issue) =>
        issue.tags?.some((label) => filters.labels?.includes(label.id)),
      );
    }

    // Filter by project
    if (filters.project && filters.project.length > 0) {
      filteredIssues = filteredIssues.filter(
        (issue) => issue.project && filters.project?.includes(issue.project.id),
      );
    }

    return filteredIssues;
  },

  // Status management
  updateIssueStatus: (issueId: string, newStatus: string) => {
    get().updateIssue(issueId, { status: newStatus });
  },

  // Priority management
  updateIssuePriority: (issueId: string, newPriority: string) => {
    get().updateIssue(issueId, { priority: newPriority });
  },

  // Assignee management
  updateIssueAssignee: (issueId: string, newAssignee: User | null) => {
    get().updateIssue(issueId, { assignee: newAssignee });
  },

  // Labels management
  addIssueLabel: (issueId: string, label: LabelInterface) => {
    const issue = get().getIssueById(issueId);
    if (issue) {
      const updatedLabels = [...(issue.tags || []), label];
      get().updateIssue(issueId, { tags: updatedLabels });
    }
  },

  removeIssueLabel: (issueId: string, labelId: string) => {
    const issue = get().getIssueById(issueId);
    if (issue) {
      const updatedLabels = issue.tags?.filter((label) => label.id !== labelId);
      get().updateIssue(issueId, { tags: updatedLabels });
    }
  },

  // Project management
  updateIssueProject: (issueId: string, newProject: Project | undefined) => {
    get().updateIssue(issueId, { project: newProject });
  },

  // Utility functions
  getIssueById: (id: string) => get().issues.find((issue) => issue.id === id),
}));
