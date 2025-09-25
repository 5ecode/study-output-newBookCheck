<!-- src/views/BookShelfView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue';
import { useStatefullBooksStore } from '../stores/StatefulBooksStore';
import { useBookShelfStore } from '../stores/BookShelfStore';
import { useWishlistStore } from '../stores/WishlistStore';
import { useModal } from '../composables/useModal';
import BookList from '../components/BookList.vue';
import DeleteButton from '../components/DeleteButton.vue';
import DetaileModal from '../components/DetaileModal.vue';
import EmptyState from '../components/EmptyState.vue';
import StateButton from '../components/StateButton.vue';
import { isAfterToday } from '../utils/isAfterToday';
import { isAlreadyAdded } from '../utils/isAlreadyAdded';
import type { State, BookWithId } from '../types/common';

/* constant
---------------------------------- */
const useStatefull = useStatefullBooksStore();
const useBookShelf = useBookShelfStore();
const useWishlist = useWishlistStore();

/* lifecycle hooks
---------------------------------- */
// ストレージの書籍リストを読み込む
onMounted(() => {
  useStatefull.loadFromStorage();
  useBookShelf.loadFromStorage();
  useWishlist.loadFromStorage();
  updateWishlist();
});

/* function
---------------------------------- */
function updateWishlist() {
  const newBooks = useStatefull.books;
  const wishlistBooks = newBooks.filter(function (item) {
    return item.state === 'pending';
  });

  // ストレージへ保存
  useWishlist.books = wishlistBooks;
  useWishlist.saveToStorage();
}

// 書籍を本棚に移動
function changeStateBought(book: BookWithId) {
  if (!isAlreadyAdded(book, useBookShelf.books)) {
    useBookShelf.books.push({ ...book });
    useBookShelf.saveToStorage();
  }

  updateBookState(book.id, 'bought');
}

// 書籍の状態を更新
function updateBookState(id: number, changeState: State = null) {
  useStatefull.books = useStatefull.books.filter(function (book) {
    if (book.id === id) {
      book.state = changeState;
      return { ...book };
    } else {
      return { ...book };
    }
  });
  useStatefull.saveToStorage();

  deleteBook(id);
  closeDetail();
}

// 保留から書籍削除
function deleteBook(id: number) {
  useWishlist.books = useWishlist.books.filter(book => book.id !== id);
  useWishlist.saveToStorage();
}

// 削除確認
function deleteConfirm(id: number) {
  const result = confirm('発売から3か月以上経った書籍は削除すると元に戻せません。\n本当に削除しますか？');
  if (result) {
    updateBookState(id);
  }
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
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-medium">保留中</h2>
    </div>
    <template v-if="useWishlist.books && useWishlist.books.length > 0">
      <BookList :books="useWishlist.books" @modal-opened="openDetail" />
    </template>
    <template v-else>
      <EmptyState msg="保留にしている書籍はありません" />
    </template>
  </div>

  <!-- モーダル -->
  <DetaileModal :is-show="isShow" :book="detailTargetBook" @modal-closed="closeDetail">

    <StateButton v-if="isAfterToday(detailTargetBook!.date)" @clicked="updateBookState(detailTargetBook!.id, 'ordered')">予約済</StateButton>

    <StateButton v-if="isAfterToday(detailTargetBook!.date)" @clicked="changeStateBought(detailTargetBook!)">購入済</StateButton>

    <DeleteButton @click="deleteConfirm(detailTargetBook!.id)" class="ml-auto" />
  </DetaileModal>
</template>

