// src/stores/WishlistStore.ts
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useStorageHelper } from '../composables/useStorageHelper';
import type { BookWithId } from '../types/common';

export const useWishlistStore = defineStore('wishlist', () => {
  const storageKey = 'wishlist';
  const books = ref<BookWithId[]>([]);
  const {
    loadFromStorage,
    saveToStorage,
  } = useStorageHelper(storageKey, books);

  return { books, loadFromStorage, saveToStorage };
});
