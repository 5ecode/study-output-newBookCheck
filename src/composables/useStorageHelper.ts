
// src/composables/useStorageHelper.ts
export function useStorageHelper<T>(storageKey: string, list: { value: T }) {
  // ローカルストレージに保存したデータを読み込む
  function loadFromStorage() {
    const data = localStorage.getItem(storageKey);
    if (data) {
      list.value = JSON.parse(data);
    }
  }

  // ローカルストレージ更新
  function saveToStorage() {
    localStorage.setItem(storageKey, JSON.stringify(list.value));
  }

  return { loadFromStorage, saveToStorage };
}
