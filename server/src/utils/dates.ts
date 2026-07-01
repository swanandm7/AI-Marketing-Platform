/**
 * Date range resolution utility.
 * All connectors call this with the timeRange string from the intent router.
 * Returns ISO date strings (YYYY-MM-DD) for the API call.
 */

export interface DateRange {
  startDate: string;
  endDate: string;
}

type TimeRange =
  | 'last_7_days'
  | 'last_28_days'
  | 'last_90_days'
  | 'this_month'
  | 'last_month';

function fmt(date: Date): string {
  return date.toISOString().split('T')[0];
}

function sub(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

export function resolveDateRange(timeRange: string): DateRange {
  const today = new Date();

  const resolvers: Record<TimeRange, () => DateRange> = {
    last_7_days: () => ({
      startDate: fmt(sub(today, 7)),
      endDate: fmt(today),
    }),
    last_28_days: () => ({
      startDate: fmt(sub(today, 28)),
      endDate: fmt(today),
    }),
    last_90_days: () => ({
      startDate: fmt(sub(today, 90)),
      endDate: fmt(today),
    }),
    this_month: () => ({
      startDate: fmt(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: fmt(today),
    }),
    last_month: () => {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { startDate: fmt(start), endDate: fmt(end) };
    },
  };

  const resolver = resolvers[timeRange as TimeRange] ?? resolvers['last_28_days'];
  return resolver();
}
