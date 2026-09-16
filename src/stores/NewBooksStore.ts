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
