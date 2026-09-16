import type { BookData, BookWithId } from '../types/common';

/* 重複登録チェック
-------------------------------------------- */
export function isAlreadyAdded(book: BookWithId | BookData, books: BookWithId[]) {
  // ISBNがある場合はISBNでチェック、ない場合はタイトル・著者・発売日でチェック
  return books.some(b =>
    (b.isbn
      ? b.isbn === book.isbn
      : b.title === book.title && b.author === book.author &&
      b.date === book.date
    ),
  );
}
