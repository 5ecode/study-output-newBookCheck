import { useBookShelfStore } from '../stores/BookShelfStore';
import { useNewBooksStore } from '../stores/NewBooksStore';
import { useStatefullBooksStore } from '../stores/StatefulBooksStore';
import { formatDate } from '../utils/formatDate';
import { parseLocalDate } from '../utils/parseLocalDate';
import { getDaysAgo } from '../utils/getDaysAgo';
import type { BookWithId } from '../types/common';

/* 状態付き書籍情報の更新
-------------------------------------------- */
export function updateStatefulBooks(updateStateful: boolean) {
  const useNewBooks = useNewBooksStore();
  const useStatefull = useStatefullBooksStore();
  const useBookShelf = useBookShelfStore();

  const newBooks = useNewBooks.books;
  const statefulBooks = useStatefull.books;

  // 新刊情報と状態付き書籍情報をマージ
  const merged = newBooks.map(book => {
    const existing = statefulBooks.find(b => b.isbn === book.isbn);
    return existing
      ? { ...book, state: existing.state }
      : { ...book, state: null };
  });

  // 更新が必要な場合
  if (updateStateful) {
    const today = parseLocalDate(formatDate(new Date()));
    const filtered: BookWithId[] = [];

    // 3か月（90日）前の日付を計算
    const ninetyDaysAgo = getDaysAgo(90);

    // マージした書籍情報をループして状態を更新
    for (const book of merged) {
      // 予約済 → 発売日を過ぎたら購入済に変更
      if (book.state === 'ordered' && parseLocalDate(book.date) <= today) {
        book.state = 'bought';

        // 本棚に追加
        if (!useBookShelf.books.some(b => b.isbn === book.isbn)) {
          useBookShelf.books.push({ ...book });
        }
      }

      // 発売から3か月（90日）以内の本だけ残す
      if (parseLocalDate(book.date) > ninetyDaysAgo) {
        filtered.push(book);
      }
    }

    // 本棚更新
    useBookShelf.saveToStorage();

    // 発売日順にソート
    const sortedDates = filtered.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // 状態付き書籍更新
    useStatefull.books = sortedDates;
    useStatefull.saveToStorage();
  } else {
    // 発売日順にソート
    const sortedDates = merged.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // 状態付き書籍更新
    useStatefull.books = sortedDates;
    useStatefull.saveToStorage();
  }
}
