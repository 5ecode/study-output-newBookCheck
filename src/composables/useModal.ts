// src/composables/useModal.ts
import { ref, nextTick } from 'vue';
import type { BookWithId } from '../types/common';

export function useModal() {
  const isShow = ref(false);
  const detailTargetBook = ref<BookWithId | null>(null);
  const triggerElement = ref<HTMLElement | null>(null);
  const navFirst = document.querySelector('nav a') as HTMLElement | null;

  // 詳細モーダルを開く
  function openDetail(book: BookWithId, e: Event) {
    triggerElement.value = e.currentTarget as HTMLElement;
    detailTargetBook.value = book;
    isShow.value = true;
  }

  // 詳細モーダルを閉じる
  async function closeDetail() {
    detailTargetBook.value = null;
    isShow.value = false;

    await nextTick();
    const el = triggerElement.value;
    if (!el) return;

    if (document.body.contains(el)) {
      el.focus();
      return;
    }

    navFirst?.focus();
  }

  return {
    isShow,
    detailTargetBook,
    openDetail,
    closeDetail,
  };
}
