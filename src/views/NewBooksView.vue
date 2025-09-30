<!-- src/views/NewBooksView.vue -->
<script setup lang="ts">
import { onMounted, ref, computed  } from 'vue';
import { useBookShelfStore } from '../stores/BookShelfStore';
import { useEntryStore } from '../stores/EntryStore';
import { useNewBooksStore } from '../stores/NewBooksStore';
import { useStatefullBooksStore } from '../stores/StatefulBooksStore';
import { useWishlistStore } from '../stores/WishlistStore';
import { ListCheck, CalendarCheck } from 'lucide-vue-next';
import { useBookSearchApi } from '../composables/useBookSearchApi';
import { useModal } from '../composables/useModal';
import { updateStatefulBooks } from '../composables/useUpdateStatefulBooks';
import { isAlreadyAdded } from '../utils/isAlreadyAdded';
import { isAfterToday } from '../utils/isAfterToday';
import { formatDate } from '../utils/formatDate';
import BookList from '../components/BookList.vue';
import Calendar from '../components/Calendar.vue';
import DetaileModal from '../components/DetaileModal.vue';
import EmptyState from '../components/EmptyState.vue';
import StateButton from '../components/StateButton.vue';
import type { State, BookWithId } from '../types/common';

/* constant
---------------------------------- */
const useEntry = useEntryStore();
const useNewBooks = useNewBooksStore();
const useStatefull = useStatefullBooksStore();
const useBookShelf = useBookShelfStore();
const useWishlist = useWishlistStore();
const storageKey = 'lastRunDate';
const baseStyle = 'flex items-center p-[6px] border border-[#a16a00] transition';
const activeStyle = 'bg-[#a16a00] text-white cursor-default';
const hoverStyle = 'bg-[#fff] hover:bg-[#a16a00] hover:text-white cursor-pointer';

/* reactivity
---------------------------------- */
const viewType = ref<'index' | 'calendar'>('index');

/* computed
---------------------------------- */
// 表示用リストを作る
const booksForDisplay = computed<BookWithId[]>(() =>
  useStatefull.books.filter(book => book.state !== 'bought'),
);

/* lifecycle hooks
---------------------------------- */
onMounted(() => {
  useNewBooks.loadFromStorage();
  useStatefull.loadFromStorage();
  useBookShelf.loadFromStorage();
  useWishlist.loadFromStorage();
  useEntry.loadFromStorage();
  updateNewBooks();
});

/* function
---------------------------------- */
// 日に一度だけ最新情報取得
async function updateNewBooks() {
  const today = formatDate(new Date());
  const lastFetchDate = localStorage.getItem(storageKey);

  if (lastFetchDate !== today) {
    // 新刊定義から外れた書籍を削除
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    useNewBooks.books = useNewBooks.books.filter(book => new Date(book.date) >= threeMonthsAgo);
    useNewBooks.saveToStorage();

    // 最新の新刊情報取得
    await useBookSearchApi(useEntry.keywordList, true);

    // 最新更新日を記録
    localStorage.setItem(storageKey, today);
  } else {
    updateStatefulBooks(false);
  }
}

// 状態を変更
function changeState(book: BookWithId, state: State) {
  if (book.state === state) return;

  book.state = state;
  useStatefull.saveToStorage();

  // 本棚に保存
  if (state === 'bought' && !isAlreadyAdded(book, useBookShelf.books)) {
    useBookShelf.books.push({ ...book });
    useBookShelf.saveToStorage();

    // 保留中からは削除
    useWishlist.books = useWishlist.books.filter(b => b.isbn !== book.isbn);
    useWishlist.saveToStorage();
  }

  // 保留中に保存
  if (state === 'pending' && !isAlreadyAdded(book, useWishlist.books)) {
    useWishlist.books.push({ ...book });
    useWishlist.saveToStorage();
  }

  closeDetail();
}

// モーダルロジック
const {
  isShow,
  detailTargetBook,
  openDetail,
  closeDetail,
} = useModal();
</script>

<template>
  <div class="px-[15px]">
    <div class="flex justify-between items-center mb-6 sm:relative">
      <h2 class="text-xl font-medium">新刊情報</h2>

      <div class="flex justify-center items-center fixed sm:absolute top-[54px] sm:top-[50%] right-[15px] sm:transform sm:-translate-y-1/2 z-10 text-[#a16a00]">
        <button @click="viewType = 'index'" :aria-pressed="viewType === 'index'" :class="[baseStyle, 'rounded-l', viewType === 'index'? activeStyle : hoverStyle]" aria-label="一覧"><ListCheck :size="26" /></button>
        <button @click="viewType = 'calendar'" :aria-pressed="viewType === 'calendar'" :class="[baseStyle, 'rounded-r', viewType === 'calendar'? activeStyle : hoverStyle]" aria-label="カレンダー"><CalendarCheck :size="26" /></button>
      </div>
    </div>
  </div>

  <template v-if="booksForDisplay && booksForDisplay.length > 0">
    <div v-if="viewType === 'index'" class="px-[15px]">
      <BookList :is-home="true" :books="booksForDisplay" @modal-opened="openDetail" />
    </div>
    <template v-if="viewType === 'calendar'">
      <Calendar @modal-opened="openDetail" :books="useStatefull.books" />
    </template>
  </template>
  <template v-else>
    <EmptyState msg="未購入の新刊情報はありません" />
  </template>

  <!-- モーダル -->
  <DetaileModal :is-show="isShow" :book="detailTargetBook" @modal-closed="closeDetail">
    <StateButton v-if="isAfterToday(detailTargetBook!.date)" :is-active="detailTargetBook?.state === 'ordered'" @clicked="changeState(detailTargetBook!, 'ordered')">予約済</StateButton>

    <StateButton :is-active="detailTargetBook?.state === 'bought'" @clicked="changeState(detailTargetBook!, 'bought')">購入済</StateButton>

    <StateButton :is-active="detailTargetBook?.state === 'pending'" @clicked="changeState(detailTargetBook!, 'pending')">保留中</StateButton>

    <button @click="changeState(detailTargetBook!, null)" class="cursor-pointer hover:underline">リセット</button>
  </DetaileModal>
</template>
