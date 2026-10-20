import type { BookWithId } from '../types/common';
import { parseLocalDate } from '../utils/parseLocalDate';

/* 発売日順にソート
-------------------------------------------- */
export function sortByReleaseDate(books: BookWithId[]) {
  return books.sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());
}
