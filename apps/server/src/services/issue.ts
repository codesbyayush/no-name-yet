import { issueKey as issueKeyConfig } from '@/config';
import type { StatusEnum } from '@/db/schema';

export type PullRequestAction =
  | 'opened'
  | 'reopened'
  | 'ready_for_review'
  | 'closed'
  | 'converted_to_draft';

/**
 * Generate a unique issue key for a board
 * Format: {team-slug}-{serial}
 */
export function generateIssueKey(teamName: string, teamSerial: number) {
  const teamNameSplit = teamName.split(' ');
  let slug: string;
  if (teamNameSplit.length > 1) {
    slug = teamNameSplit
      .map((word, index) =>
        index < issueKeyConfig.maxTeamWordsForSlug ? word.charAt(0) : '',
      )
      .join('')
      .toLowerCase();
  } else {
    slug = teamNameSplit[0]
      .substring(0, issueKeyConfig.defaultSlugLength)
      .toLowerCase();
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
): StatusEnum | null {
  if (action === 'ready_for_review') {
    return 'technical-review';
  }

  if (
    action === 'opened' ||
    action === 'reopened' ||
    action === 'converted_to_draft'
  ) {
    return 'in-progress';
  }

  if (action === 'closed' && isMerged) {
    const isDefaultBranch =
      baseBranch.toLowerCase() === defaultBranch.toLowerCase();
    return isDefaultBranch ? 'completed' : 'paused';
  }

  return null;
}
