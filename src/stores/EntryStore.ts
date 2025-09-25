// src/stores/EntryStore.ts
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useStorageHelper } from '../composables/useStorageHelper';
import type { KeywordSet } from '../types/common';

export const useEntryStore = defineStore('entry', () => {
  const storageKey = 'keyword';
  const keywordList = ref<KeywordSet[]>([]);
  const {
    loadFromStorage,
    saveToStorage,
  } = useStorageHelper(storageKey, keywordList);

  return { keywordList, loadFromStorage, saveToStorage };
});
