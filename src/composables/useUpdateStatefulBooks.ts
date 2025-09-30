/* 新刊情報をマージ
-------------------------------------------- */
import { useBookShelfStore } from '../stores/BookShelfStore';
import { useNewBooksStore } from '../stores/NewBooksStore';
import { useStatefullBooksStore } from '../stores/StatefulBooksStore';
import type { BookWithId } from '../types/common';


export function updateStatefulBooks(runDateBasedUpdates: boolean) {
  const useNewBooks = useNewBooksStore();
  const useStatefull = useStatefullBooksStore();
  const useBookShelf = useBookShelfStore();

  const newBooks = useNewBooks.books;
  const statefulBooks = useStatefull.books;

  // マージ処理
  const merged = newBooks.map(book => {
    const existing = statefulBooks.find(b => b.isbn === book.isbn);
    return existing
      ? { ...book, state: existing.state }
      : { ...book, state: null };
  });

  if (runDateBasedUpdates) {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const filtered: BookWithId[] = [];

    for (const book of merged) {
    // 予約済 → 発売日を過ぎたら購入済
      if (book.state === 'ordered' && new Date(book.date) <= today) {
        book.state = 'bought';

        if (!useBookShelf.books.some(b => b.isbn === book.isbn)) {
          useBookShelf.books.push({ ...book });
        }
      }

      // 発売から3か月以内の本だけ残す
      if (new Date(book.date) > threeMonthsAgo) {
        filtered.push(book);
      }
    }

    // 本棚更新
    useBookShelf.saveToStorage();

    // 発売日順にソート
    const sortedDates = filtered.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    useStatefull.books = sortedDates;
    useStatefull.saveToStorage();
  } else {
    const sortedDates = merged.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    useStatefull.books = sortedDates;
    useStatefull.saveToStorage();
  }
}
