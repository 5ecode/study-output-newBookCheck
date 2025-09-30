// src/stores/NewBooksStore.ts
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useStorageHelper } from '../composables/useStorageHelper';
import { isAlreadyAdded } from '../utils/isAlreadyAdded';
import type { BookData, BookWithId } from '../types/common';

export const useNewBooksStore = defineStore('new', () => {
  const storageKey = 'new-books';
  const books = ref<BookWithId[]>([]);
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
    for (const book of newBooks) {
      if (!isAlreadyAdded(book, books.value)) {
        books.value.push({
          id: nextId.value,
          title: book.title,
          author: book.author,
          salesDate: book.salesDate,
          itemUrl: book.itemUrl,
          imageUrl: book.imageUrl,
          date: book.date,
          isbn: book.isbn,
          state: null,
          size: book.size,
        });
        saveToStorage();
      }
    }
    loadFromStorage();
  }

  return { books, loadFromStorage, saveToStorage, addNewBooks };
});
