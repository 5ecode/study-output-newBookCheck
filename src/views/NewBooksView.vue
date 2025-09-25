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
  useEntry.loadFromStorage();
  updateNewBooks();
});

/* function
---------------------------------- */
// 新刊情報を取得してマージ
function updateStatefulBooks() {
  const newBooks = useNewBooks.books;
  const statefulBooks = useStatefull.books;

  // マージ処理
  const merged = newBooks.map(book => {
    const existing = statefulBooks.find(b => b.isbn === book.isbn);
    return existing
      ? { ...book, state: existing.state }
      : { ...book, state: null };
  });

  // 予約済の書籍は発売日を過ぎたら購入済に変更
  const today = new Date();
  for (const book of merged) {
    if (book.state === 'ordered' && new Date(book.date) <= today) {
      book.state = 'bought';
      // 本棚に追加
      if (!isAlreadyAdded(book, useBookShelf.books)) {
        useBookShelf.books.push({ ...book });
        useBookShelf.saveToStorage();
      }
    }
  }

  // 発売日が新しい順にソート
  const sortedDates = merged.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // ストレージへ保存
  useStatefull.books = sortedDates;
  useStatefull.saveToStorage();
}

// 日に一度だけ最新情報取得
async function updateNewBooks() {
  const today = formatDate(new Date());
  const lastFetchDate = localStorage.getItem(storageKey);

  if (lastFetchDate !== today) {
    useNewBooks.books = [];
    useNewBooks.saveToStorage();
    await useBookSearchApi(useEntry.keywordList);
  }

  updateStatefulBooks();

  // 最新更新日を記録
  localStorage.setItem(storageKey, today);
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
  }

  // 保留に保存
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


// リセット
// function reset() {
//   localStorage.removeItem('new-books'); // 保存データ削除
//   localStorage.removeItem(storageKey);  // 最終更新日もリセット
//   localStorage.removeItem('stateful-books');
//   localStorage.removeItem('bookShelf');
//   localStorage.removeItem('wishlist');
//   location.reload();
// }

</script>

<template>
  <div class="px-[15px]">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-medium">新刊情報</h2>

      <div class="flex justify-center items-center fixed sm:static top-[54px] right-[15px] z-10 text-[#a16a00]">
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

  <!-- <button @click="reset">リストを削除</button> -->
</template>
