// src/stores/NewBooksStore.ts
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useStorageHelper } from '../composables/useStorageHelper';
import { isAlreadyAdded } from '../utils/isAlreadyAdded';
import type { BookData, BookWithId } from '../types/common';

export const useNewBooksStore = defineStore('new', () => {
  const storageKey = 'new-books';
  const books = ref<BookWithId[]>([]);
  const hasNewBookUpdate = ref(false);
  const {
    loadFromStorage,
    saveToStorage,
  } = useStorageHelper(storageKey,books);

  // リストID
  const nextId = computed((): number => {
    if (books.value.length === 0) return 1;
    return Math.max(...books.value.map(book => book.id)) + 1;
  });

  // 書籍を追加
  function addNewBooks(newBooks: BookData[]) {
    let isAdded = false;
    for (const newBook of newBooks) {
      if (!isAlreadyAdded(newBook, books.value)) {
        // 同じisbnがある場合は、一度書籍を削除
        if (newBook.isbn) {
          books.value = books.value.filter(book => book.isbn !== newBook.isbn);
        }

        // 新しい書籍を追加
        books.value.push({
          id: nextId.value,
          title: newBook.title,
          author: newBook.author,
          salesDate: newBook.salesDate,
          itemUrl: newBook.itemUrl,
          imageUrl: newBook.imageUrl,
          date: newBook.date,
          isbn: newBook.isbn,
          state: null,
          size: newBook.size,
        });

        isAdded = true;
      }
    }

    // 追加後にローカルストレージに保存
    if (isAdded) {
      saveToStorage();
      hasNewBookUpdate.value = true;
    }

    // 新刊情報をローカルストレージから読み込む
    loadFromStorage();
  }

  return { books, loadFromStorage, saveToStorage, addNewBooks, hasNewBookUpdate };
});
