// CSV generation utilities following RFC 4180 standard

import { OrderWithItems } from '@/types';

/**
 * Escapes a value for CSV format
 * Handles commas, quotes, and newlines according to RFC 4180
 */
export function escapeCsvValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Converts an array of values to a CSV row
 */
export function toCsvRow(values: (string | number | boolean | null | undefined)[]): string {
  return values.map(escapeCsvValue).join(',');
}

/**
 * Formats a date for CSV export
 */
export function formatDateForCsv(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Formats a time for CSV export
 */
export function formatTimeForCsv(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Formats a full timestamp for CSV export
 */
export function formatTimestampForCsv(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Generates CSV content from orders data
 * One row per drink item (not per order)
 */
export function generateOrdersCsv(orders: OrderWithItems[]): string {
  const headers = [
    'Order Number',
    'Order Date',
    'Order Time',
    'Order ID',
    'Guest Name',
    'Group Name',
    'Drink Name',
    'Quantity',
    'Notes',
    'Is Custom',
    'Status',
    'Completed At',
  ];

  const rows: string[] = [toCsvRow(headers)];

  // Sort orders by order_number ascending
  const sortedOrders = [...orders].sort((a, b) => a.order_number - b.order_number);

  // Generate one row per drink item
  for (const order of sortedOrders) {
    for (const item of order.order_items) {
      const row = [
        order.order_number,
        formatDateForCsv(order.created_at),
        formatTimeForCsv(order.created_at),
        order.id,
        order.guest_name,
        order.group_name || '',
        item.item_name,
        item.quantity,
        item.notes || '',
        item.is_custom ? 'Yes' : 'No',
        order.status,
        order.updated_at ? formatTimestampForCsv(order.updated_at) : '',
      ];

      rows.push(toCsvRow(row));
    }
  }

  return rows.join('\n');
}

/**
 * Generates a filename for the CSV export
 */
export function generateCsvFilename(prefix: string = 'orders_export'): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `${prefix}_${dateStr}.csv`;
}
