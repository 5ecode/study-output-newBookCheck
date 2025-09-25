// src/stores/BookShelfStore.ts
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useStorageHelper } from '../composables/useStorageHelper';
import type { BookWithId } from '../types/common';

export const useBookShelfStore = defineStore('bookShelf', () => {
  const storageKey = 'bookShelf';
  const books = ref<BookWithId[]>([]);
  const {
    loadFromStorage,
    saveToStorage,
  } = useStorageHelper(storageKey, books);

  return { books, loadFromStorage, saveToStorage };
});
