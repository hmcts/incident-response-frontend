import { formatInTimeZone, toDate } from 'date-fns-tz';

export function date(value: string): string {
  const parsedDate = toDate(value, { timeZone: 'UTC' });
  return formatInTimeZone(parsedDate, 'Europe/London', 'MMM d, yyyy, h:mm a');
}
