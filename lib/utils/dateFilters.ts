// Date filtering utilities for the bartender dashboard

export type DateFilter = 'today' | 'week' | 'month' | 'all';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Gets the start and end dates for a given filter
 * Week starts on Monday per user preference
 */
export function getDateRange(filter: DateFilter = 'week'): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1), // End of today
      };

    case 'week': {
      // Get current day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = today.getDay();
      // Calculate days since Monday (Monday = 0, Sunday = 6)
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      // Start of week (Monday at 00:00:00)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - daysSinceMonday);

      // End of week (Sunday at 23:59:59)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      weekEnd.setTime(weekEnd.getTime() - 1);

      return {
        start: weekStart,
        end: weekEnd,
      };
    }

    case 'month': {
      // Start of current month
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // End of current month
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      return {
        start: monthStart,
        end: monthEnd,
      };
    }

    case 'all':
      return {
        start: null,
        end: null,
      };

    default:
      return {
        start: null,
        end: null,
      };
  }
}

/**
 * Gets a human-readable label for a date filter
 */
export function getFilterLabel(filter: DateFilter): string {
  switch (filter) {
    case 'today':
      return 'Today';
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    case 'all':
      return 'All Time';
    default:
      return 'All Time';
  }
}

/**
 * Formats a date range for display
 */
export function formatDateRange(range: DateRange): string {
  if (!range.start || !range.end) {
    return 'All time';
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  const startStr = range.start.toLocaleDateString('en-US', formatOptions);
  const endStr = range.end.toLocaleDateString('en-US', formatOptions);

  return `${startStr} - ${endStr}`;
}
