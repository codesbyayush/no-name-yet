export function slugifyTitle(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]+/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function slugifyUserName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildBranchName(params: {
  issueKey: string;
  title?: string;
  assigneeName?: string | null;
}): string {
  const key = params.issueKey.toLowerCase();
  const titleSlug = params.title ? slugifyTitle(params.title) : undefined;
  const user = params.assigneeName
    ? slugifyUserName(params.assigneeName)
    : undefined;
  if (user) {
    return titleSlug ? `${user}/${key}/${titleSlug}` : `${user}/${key}`;
  }
  return titleSlug ? `${key}/${titleSlug}` : key;
}
