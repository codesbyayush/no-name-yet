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

export const session = {
  expiresInSeconds: 60 * 60 * 24 * 28, // 28 days
  updateAgeSeconds: 60 * 60 * 24 * 7, // 7 days
} as const;

export const stateToken = {
  freshnessWindowMinutes: 15,
} as const;

export const github = {
  baseUrl: 'https://github.com',
  installationsPath: '/settings/installations',
  getAppInstallUrl: (appName: string) =>
    `https://github.com/apps/${appName}/installations/new`,
  getInstallationSettingsUrl: (installationId: number) =>
    `https://github.com/settings/installations/${installationId}`,
} as const;

export const defaultBoards = [
  {
    name: 'Feature Requests',
    slug: 'features',
    description: 'Collect ideas and feature requests',
  },
  {
    name: 'Bugs',
    slug: 'bugs',
    description: 'Report and track bugs',
  },
  {
    name: 'Internal',
    slug: 'internal',
    description: 'Internal tickets for the team',
    isSystem: true,
    isPrivate: true,
  },
] as const;

export const defaultTags = [
  { name: 'UI Enhancement', color: 'purple' },
  { name: 'Bug', color: 'red' },
  { name: 'Feature', color: 'green' },
  { name: 'Documentation', color: 'blue' },
  { name: 'Refactor', color: 'yellow' },
  { name: 'Performance', color: 'orange' },
  { name: 'Design', color: 'pink' },
  { name: 'Security', color: 'gray' },
  { name: 'Accessibility', color: 'indigo' },
  { name: 'Testing', color: 'teal' },
  { name: 'Internationalization', color: 'cyan' },
] as const;
