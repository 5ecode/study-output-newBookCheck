// src/stores/StatefulBooksStore.ts
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useStorageHelper } from '../composables/useStorageHelper';
import type { BookWithId } from '../types/common';

export const useStatefullBooksStore = defineStore('stateful', () => {
  const storageKey = 'stateful-books';
  const books = ref<BookWithId[]>([]);
  const {
    loadFromStorage,
    saveToStorage,
  } = useStorageHelper(storageKey, books);

  return { books, loadFromStorage, saveToStorage };
});
