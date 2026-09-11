export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayISO(): string {
  return formatDateToISO(new Date());
}

export function formatFriendlyDate(dateString: string): string {
  const today = getTodayISO();
  const yesterday = formatDateToISO(new Date(Date.now() - 86400000));
  const tomorrow = formatDateToISO(new Date(Date.now() + 86400000));

  if (dateString === today) return 'Today';
  if (dateString === yesterday) return 'Yesterday';
  if (dateString === tomorrow) return 'Tomorrow';

  const date = parseISODate(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDayOfWeek(dateString: string): string {
  const date = parseISODate(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDayNumber(dateString: string): number {
  const date = parseISODate(dateString);
  return date.getDate();
}

export function getDaysAround(centerDateString: string, count: number = 7): string[] {
  const centerDate = parseISODate(centerDateString);
  const half = Math.floor(count / 2);
  const dates: string[] = [];

  for (let i = -half; i <= half; i++) {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + i);
    dates.push(formatDateToISO(d));
  }
  return dates;
}

export function getPastNDays(n: number = 7, endDateString?: string): string[] {
  const end = endDateString ? parseISODate(endDateString) : new Date();
  const dates: string[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    dates.push(formatDateToISO(d));
  }
  return dates;
}

export function shiftDate(dateString: string, deltaDays: number): string {
  const d = parseISODate(dateString);
  d.setDate(d.getDate() + deltaDays);
  return formatDateToISO(d);
}

export function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
