/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 * @param time24 - Time in "HH:mm" format (e.g., "14:30")
 * @returns Time in "h:mm AM/PM" format (e.g., "2:30 PM")
 */
export function format24To12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Converts 12-hour time format to 24-hour format
 * @param hours - Hour in 12-hour format (1-12)
 * @param minutes - Minutes (0-59)
 * @param period - 'AM' or 'PM'
 * @returns Time in "HH:mm" format (e.g., "14:30")
 */
export function format12To24Hour(hours: number, minutes: number, period: 'AM' | 'PM'): string {
  let hours24 = hours;
  if (period === 'AM' && hours === 12) hours24 = 0;
  if (period === 'PM' && hours !== 12) hours24 = hours + 12;
  return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Parses 24-hour time into components for 12-hour display
 * @param time24 - Time in "HH:mm" format
 * @returns Object with hours (1-12), minutes (0-59), and period ('AM'/'PM')
 */
export function parse24Hour(time24: string): { hours: number; minutes: number; period: 'AM' | 'PM' } {
  const [hours24, minutes] = time24.split(':').map(Number);
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  return { hours, minutes, period };
}
