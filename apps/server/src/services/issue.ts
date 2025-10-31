export type IssueStatus =
  | 'to-do'
  | 'in-progress'
  | 'technical-review'
  | 'completed'
  | 'backlog'
  | 'paused';

export type PullRequestAction =
  | 'opened'
  | 'reopened'
  | 'ready_for_review'
  | 'closed';

/**
 * Generate a unique issue key for a board
 * Format: OF-{count + 1}
 */
const MAX_TEAM_WORDS_FOR_SLUG = 3;
const DEFAULT_SLUG_LENGTH = 3;

export function generateIssueKey(teamName: string, teamSerial: number) {
  const teamNameSplit = teamName.split(' ');
  let slug: string;
  if (teamNameSplit.length > 1) {
    slug = teamNameSplit
      .map((word, index) =>
        index < MAX_TEAM_WORDS_FOR_SLUG ? word.charAt(0) : '',
      )
      .join('')
      .toLowerCase();
  } else {
    slug = teamNameSplit[0].substring(0, DEFAULT_SLUG_LENGTH).toLowerCase();
  }

  return `${slug}-${teamSerial}`;
}

// Regex pattern for issue key extraction - defined at module level for performance
const ISSUE_KEY_PATTERN = /^(?:[a-z0-9][a-z0-9-]*\/)?([a-z0-9]+-\d+)(?:\/.*)?$/;

/**
 * Extract issue key from Git branch name
 * Supports patterns like:
 * - "pe-102/title" -> "pe-102"
 * - "ayush/pe-102/title" -> "pe-102"
 * - "feature/OF-123/description" -> "OF-123"
 */
export function extractIssueKeyFromBranch(branchName: string): string | null {
  const m = branchName.toLowerCase().match(ISSUE_KEY_PATTERN);
  return m ? m[1] : null;
}

/**
 * Map GitHub PR action to issue status
 */
export function mapPullRequestActionToStatus(
  action: PullRequestAction,
  isMerged: boolean,
  baseBranch: string,
  defaultBranch = 'main',
): IssueStatus | null {
  if (action === 'opened' || action === 'reopened') {
    return 'in-progress';
  }

  if (action === 'ready_for_review') {
    return 'technical-review';
  }

  if (action === 'closed' && isMerged) {
    const isDefaultBranch =
      baseBranch.toLowerCase() === defaultBranch.toLowerCase();
    return isDefaultBranch ? 'completed' : 'paused';
  }

  return null;
}
