<!--src/components/DetaileModal.vue-->
<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { State, BookWithId } from '../types/common';

/* props
---------------------------------- */
const props = defineProps<{
  isShow: boolean
  book: BookWithId | null;
}>();

/* emit
---------------------------------- */
const emit = defineEmits<{
  (e: 'modal-closed'): void;
  (e: 'state-changed', book: BookWithId, state: State): void
}>();

/* constant
---------------------------------- */
const titleId = 'modalTitle';

/* reactivity
---------------------------------- */
const slotContainer = ref<HTMLDivElement | null>(null);
const modalRef = ref<HTMLDivElement | null>(null);

/* watch
---------------------------------- */
// slot内のbutton要素にフォーカスを移す
watch(() => props.isShow, (val) => {
  if (val) {
    setTimeout(() => {
      if (slotContainer.value) {
        const focusable = getFocusableElements(slotContainer.value);
        focusable[0].focus();
      }
    }, 0);
  }
});

/* function
---------------------------------- */
// モーダル内でフォーカスをループ
function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab') return;

  if (props.isShow) {
    const focusable = getFocusableElements(modalRef.value);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

// モーダル内のフォーカス対象取得
function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
}
</script>

<template>
  <transition name="fade">
    <div v-if="isShow" @click.self="$emit('modal-closed')" @keydown="trapFocus" @keydown.esc="$emit('modal-closed')" class="fixed inset-0 z-50 flex items-center justify-center bg-[#008b8b]/50">
      <div ref="modalRef" :aria-labelledby="titleId" role="dialog" aria-modal="true" class="relative bg-white p-6 rounded shadow-md w-full max-w-md mx-4">
        <div class="flex flex-col-reverse items-center gap-5 mb-5">
          <div class="w-full">
            <h2 :id="titleId" class="text-xl font-bold mb-4">{{ book!.title }}</h2>
            <p>{{ book!.author }}</p>
            <p>{{ book!.salesDate }}</p>
          </div>
          <div class="flex items-center justify-center max-w-[150px] border border-[#ccc] aspect-[1/1.414]"><img :src="book?.imageUrl" alt="書影"></div>
        </div>
        <div ref="slotContainer" class="flex gap-3 text-[14px]">
          <slot></slot>
        </div>
        <div class="absolute top-[10px] right-[8px] text-right">
          <button @click="$emit('modal-closed')" class="text-[25px] text-[#261100] cursor-pointer" aria-label="閉じる"><X :size="32" /></button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
