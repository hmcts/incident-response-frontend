import { format, toDate } from 'date-fns-tz';

const timeZone = 'Europe/London';

export function date(value: string): string {
  const parsedDate = toDate(value, { timeZone: 'UTC' });
  const formatted = format(parsedDate, 'MMM d, yyyy, h:mm a', { timeZone });

  // debugging why dates aren't as expected (need to deploy to prod temporarily)
  // eslint-disable-next-line no-console
  console.log(parsedDate, formatted);
  return formatted;
}
