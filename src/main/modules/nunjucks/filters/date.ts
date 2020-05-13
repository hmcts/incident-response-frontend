import { toDate, format } from 'date-fns-tz';

const timeZone = 'Europe/London';

export function date(value: string): string {
  const date = toDate(value, { timeZone: 'UTC' });
  return format(date, 'MMM d, yyyy, h:mm a', { timeZone });
}
