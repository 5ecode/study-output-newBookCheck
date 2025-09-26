<!-- src/views/BookShelfView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue';
import { useBookShelfStore } from '../stores/BookShelfStore';
import { useStatefullBooksStore } from '../stores/StatefulBooksStore';
import BookList from '../components/BookList.vue';
import DeleteButton from '../components/DeleteButton.vue';
import DetaileModal from '../components/DetaileModal.vue';
import EmptyState from '../components/EmptyState.vue';
import { useModal } from '../composables/useModal';

/* constant
---------------------------------- */
const useStatefull = useStatefullBooksStore();
const useBookShelf = useBookShelfStore();

/* lifecycle hooks
---------------------------------- */
// ストレージの書籍リストを読み込む
onMounted(() => {
  useStatefull.loadFromStorage();
  useBookShelf.loadFromStorage();
});

/* function
---------------------------------- */
// 削除確認
function deleteConfirm(id: number) {
  const result = confirm('発売から3か月以上経った書籍は削除すると元に戻せません。\n本当に削除しますか？');
  if (result) {
    deleteBook(id);
  }
}

// 本棚から書籍削除
function deleteBook(id: number) {
  useBookShelf.books = useBookShelf.books.filter(book => book.id !== id);
  useBookShelf.saveToStorage();
  updateStatefulBooks(id);
}

// 書籍の状態を更新
function updateStatefulBooks(id: number) {
  useStatefull.books = useStatefull.books.filter(function (book) {
    if (book.id === id) {
      book.state = null;
      return { ...book };
    } else {
      return { ...book };
    }
  });
  useStatefull.saveToStorage();

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
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-medium">本棚リスト</h2>
    </div>

    <template v-if="useBookShelf.books && useBookShelf.books.length > 0">
      <BookList :books="useBookShelf.books" :is-BookShelf="true"  @modal-opened="openDetail" />
    </template>
    <template v-else>
      <EmptyState msg="購入した書籍はありません" />
    </template>
  </div>

  <!-- モーダル -->
  <DetaileModal :is-show="isShow" :book="detailTargetBook" @modal-closed="closeDetail">
    <DeleteButton @click="deleteConfirm(detailTargetBook!.id)" class="ml-auto" />
  </DetaileModal>
</template>
