import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const daysBetween = (from: Date, to: Date) => {
  const ms = to.getTime() - from.getTime();
  return Math.floor(Math.max(0, ms) / (24 * 60 * 60 * 1000));
};

const isSameYear = (a: Date, b: Date) => a.getFullYear() === b.getFullYear();

export function formatSmartDate(
  input: Date | string | number,
  now: Date = new Date(),
): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = startOfDay(now);
  const thatDay = startOfDay(date);

  const diffDays = daysBetween(thatDay, today);

  if (diffDays === 0) {
    return 'today';
  }
  if (diffDays <= 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }

  // Otherwise: short date like "9 Sep" or "9 Sep 2024"
  const sameYear = isSameYear(date, now);
  const options: Intl.DateTimeFormatOptions = sameYear
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'short', year: 'numeric' };

  return new Intl.DateTimeFormat(undefined, options).format(date);
}
