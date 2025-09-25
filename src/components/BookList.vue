<!--src/components/DetaileModal.vue-->
<script setup lang="ts">
import { CircleStar, Check } from 'lucide-vue-next';
import type { BookWithId } from '../types/common';

/* props
---------------------------------- */
const props = defineProps<{
  books: BookWithId[];
  isHome?: boolean
  isBookShelf?: boolean
}>();

/* emit
---------------------------------- */
const emit = defineEmits<{
  (e: 'modal-opened', book: BookWithId, $event:Event): void
}>();
</script>

<template>
  <ul class="flex flex-col gap-y-2.5">
    <li v-for="book in books" :key="book.id" @click="$emit('modal-opened', book, $event)" @keydown.enter="$emit('modal-opened', book, $event)" class="grid grid-cols-[82px_auto] gap-2.5 py-2.5 border-b border-[#261100] cursor-pointer hover:text-[#008b8b] transition outline-[#ff907a]" tabindex="0">
      <div class="flex flex-col justify-center order-2">
        <p class="mb-1"><strong>{{ book.title }}</strong></p>
        <p class="text-sm mb-1">{{(book.author) }}</p>
        <p class="text-sm">{{(book.salesDate) }}</p>

        <template v-if="isHome">
          <p v-if="book.state === 'pending'" class="flex justify-end items-center text-[12px]"><CircleStar :size="16" class="mr-1" />保留中</p>
          <p v-if="book.state === 'ordered'" class="flex justify-end items-center text-[12px]"><Check :size="16" />予約済</p>
        </template>

      </div>
      <p class="w-full h-auto border border-[#ccc] aspect-[1/1.414] order-1"><img v-if="book.imageUrl" v-bind:src="book.imageUrl" alt="書影" class="w-auto h-full m-auto object-contain"></p>
    </li>
  </ul>
</template>
