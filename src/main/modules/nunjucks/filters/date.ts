import { format, toDate } from 'date-fns-tz';

const timeZone = 'Europe/London';

export function date(value: string): string {
  const parsedDate = toDate(value, { timeZone: 'UTC' });
  return format(parsedDate, 'MMM d, yyyy, h:mm a', { timeZone });
}
