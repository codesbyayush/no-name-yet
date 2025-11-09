export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  const pluralize = (count: number, unit: string) =>
    `${count} ${unit}${count > 1 ? 's' : ''}`;

  const rules: Array<{
    limit: number;
    format: (days: number) => string;
  }> = [
    { limit: 1, format: () => 'Today' },
    { limit: 2, format: () => 'Yesterday' },
    { limit: 7, format: (d) => `${d} days ago` },
    {
      limit: 30,
      format: (d) => `About ${pluralize(Math.floor(d / 7), 'week')} ago`,
    },
    {
      limit: 365,
      format: (d) => `About ${pluralize(Math.floor(d / 30), 'month')} ago`,
    },
  ];

  for (const rule of rules) {
    if (diffInDays < rule.limit) {
      return rule.format(diffInDays);
    }
  }

  const years = Math.floor(diffInDays / 365);
  return `About ${pluralize(years, 'year')} ago`;
};
