import { formatDate } from '../utils/formatDate';
import { parseLocalDate } from '../utils/parseLocalDate';

/* 発売日が今日より未来かを判定
-------------------------------------------- */
export function isAfterToday(releaseDate: string): boolean {
  const release = parseLocalDate(releaseDate);
  const today = parseLocalDate(formatDate(new Date()));
  return release >= today;
}
