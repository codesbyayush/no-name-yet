/**
 * Application configuration constants
 * Non-environment configurations and defaults
 */

export const pagination = {
  defaultLimit: 20,
  defaultOffset: 0,
  minLimit: 1,
  maxLimit: 100,
} as const;

export const issueKey = {
  maxTeamWordsForSlug: 3,
  defaultSlugLength: 3,
} as const;

export const cacheTTL = {
  tags: 300,
  team: 300,
  boards: 300,
} as const;

export const rateLimits = {
  maxBulkInvites: 50,
} as const;

export const avatar = {
  baseUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=',
} as const;
