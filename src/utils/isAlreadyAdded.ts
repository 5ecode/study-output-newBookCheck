import type { BookData, BookWithId } from '../types/common';

/* 重複登録チェック
-------------------------------------------- */
export function isAlreadyAdded(newBook: BookWithId | BookData, books: BookWithId[]) {
  // ISBNがある場合はISBNでチェック、ない場合はタイトル・著者・発売日でチェック
  return books.some((book) => {
    // ISBNがあれば、発売日や画像に差異があるかを確認する
    if (newBook.isbn) {
      if (book.isbn === newBook.isbn) {
        if (book.salesDate !== newBook.salesDate || book.imageUrl !== newBook.imageUrl) {
          return false;
        }
        return true;
      }
    } else {
      // ISBNがなければタイトル・著者・発売日でチェック
      if (
        book.title === newBook.title &&
        book.author === newBook.author &&
        book.salesDate === newBook.salesDate
      ) {
        return true;
      }
    }

    // 重複なし
    return false;
  });
}
