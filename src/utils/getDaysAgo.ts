import { formatDate } from '../utils/formatDate';
import { parseLocalDate } from '../utils/parseLocalDate';

/* 指定された日数前の日付を取得
-------------------------------------------- */
export function getDaysAgo(days: number): Date {
  const today = parseLocalDate(formatDate(new Date()));
  const daysAgo = new Date(today);
  daysAgo.setDate(today.getDate() - days);
  return daysAgo;
}
