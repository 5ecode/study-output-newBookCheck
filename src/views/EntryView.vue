<!-- src/views/EntryView.vue -->
<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import { useEntryStore } from '../stores/EntryStore';
import { useNewBooksStore } from '../stores/NewBooksStore';
import { useBookSearchApi } from '../composables/useBookSearchApi';
import DeleteButton from '../components/DeleteButton.vue';
import type { KeywordSet } from '../types/common';

/* constant
---------------------------------- */
const useEntry = useEntryStore();
const useNewBooks = useNewBooksStore();
const BOOK_SIZES = [
  { value: 0, label: 'すべて' },
  { value: 2, label: '文庫' },
  { value: 9, label: 'コミック' },
  { value: 3, label: '新書' },
  { value: 1, label: '単行本' },
] as const;

/* reactivity
---------------------------------- */
const title = ref<string>('');
const author = ref<string>('');
const size = ref<0 | 2 | 9 | 3 | 1>(0);
const editingId = ref<number | null>(null);
const editSize = ref(0);
const editTitle = ref<string>('');
const editAuthor = ref<string>('');
const showMsg = ref(false);
const editRadioRef = ref<HTMLInputElement | null>(null);

// エラー表示
const errors = reactive({
  entry: '',
  edit: '',
});

/* watch
---------------------------------- */
// メッセージを表示するエフェクト
watch(showMsg, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      showMsg.value = false;
    }, 5000);
  }
});

/* computed
---------------------------------- */
const nextId = computed((): number => {
  if (useEntry.keywordList.length === 0) return 1;
  return Math.max(...useEntry.keywordList.map(value => value.id)) + 1;
});

/* lifecycle hooks
---------------------------------- */
// ストレージのキーワードセットを読み込む
onMounted(() => {
  useEntry.loadFromStorage();
  useNewBooks.loadFromStorage();
});

/* function
---------------------------------- */
// キーワード登録
function keywordRegister() {
  if (!title.value && !author.value) {
    errors.entry = '書籍名、著者名どちらかを入力してください';
    return;
  }
  errors.entry = '';

  const keyword = {
    id: nextId.value,
    title: title.value ?? null,
    author: author.value ?? null,
    size: size.value,
  };
  useEntry.keywordList.push(keyword);
  useEntry.saveToStorage();

  newBookSearch([keyword]);

  title.value = '';
  author.value = '';
  size.value = 0;
}

// キーワード削除
function deleteKeywordSet(targetId: number) {
  const result = confirm('本当に削除してもよろしいですか？');

  if (result) {
    // 削除するキーワードで新刊情報から書籍を削除
    const index = useEntry.keywordList.findIndex(item => item.id === targetId);
    const targetKeyword = useEntry.keywordList[index];
    removedFromNewBooks(targetKeyword);

    // キーワードセットを削除
    useEntry.keywordList = useEntry.keywordList.filter(item => item.id !== targetId);
    useEntry.saveToStorage();
  }
}

// キーワード編集
function editKeywordSet(targetItem: { id: number,
  title: string | null,
  author: string | null,
  size: number}) {
  editingId.value = targetItem.id;
  editSize.value = targetItem.size;
  editTitle.value = targetItem.title ?? '';
  editAuthor.value = targetItem.author ?? '';

  // フォーカス移動
  nextTick(() => {
    if (editRadioRef.value) {
      editRadioRef.value.focus();
    }
  });
}

// 編集保存
function saveKeywordSet(targetId: number) {
  if (!editTitle.value && !editAuthor.value) {
    errors.edit = '書籍名、著者名どちらかを入力してください';
    return;
  }
  errors.edit = '';

  const index = useEntry.keywordList.findIndex(item => item.id === targetId);
  const originalKeyword = useEntry.keywordList[index];
  if (
    originalKeyword.title === editTitle.value &&
    originalKeyword.author === editAuthor.value &&
    originalKeyword.size === editSize.value
  ) {
    editingId.value = null;
    return;
  };

  // 変更前のキーワードで新刊情報から書籍を削除
  removedFromNewBooks(originalKeyword);

  // 変更を保存
  useEntry.keywordList[index] = {
    ...useEntry.keywordList[index],
    ...{
      id: targetId,
      size: editSize.value,
      title: editTitle.value,
      author: editAuthor.value,
    },
  };

  useEntry.saveToStorage();
  editingId.value = null;
  showMsg.value = true;

  // 変更したキーワードで検索
  newBookSearch([useEntry.keywordList[index]]);
}

// 編集キャンセル
function cancel() {
  editingId.value = null;
  editSize.value = 0;
  editTitle.value = '';
  editAuthor.value = '';
}

// 新刊情報から削除
function removedFromNewBooks(keyword: KeywordSet) {
  useNewBooks.books = useNewBooks.books.filter(book => {
    const titleMatch = keyword.title ? book.title?.includes(keyword.title) : false;
    const authorMatch = keyword.author ? book.author?.includes(keyword.author) : false;
    const sizeMatch = book.size === keyword.size;

    return !( (titleMatch || authorMatch) && sizeMatch );
  });
  useNewBooks.saveToStorage();
}

// 新刊チェック
async function newBookSearch(keywordSet: KeywordSet[]) {
  await useBookSearchApi(keywordSet);
  useNewBooks.saveToStorage();
}
</script>

<template>
  <div class="px-[15px]">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-medium ">キーワード登録</h2>
    </div>
    <div class="space-y-2 mb-10">
      <div class="flex flex-wrap sm:gap-4 gap-2">
        <template v-for="item in BOOK_SIZES" :key="item.value">
          <label class="flex items-center gap-1">
            <input v-model="size" type="radio" :value="item.value" />{{ item.label }}</label>
        </template>
      </div>

      <div class="flex flex-col gap-2" v-bind:class="[errors.entry? 'mb-4':'mb-6']">
        <label>
          書籍名:<input v-model="title" type="text" placeholder="書籍名を入力" class="border rounded p-1 w-full" />
        </label>
        <label>
          著者名:<input v-model="author" type="text" placeholder="著者名を入力" class="border rounded p-1 w-full" />
        </label>
      </div>

      <p v-if="errors.entry" class="text-red-500 text-sm mb-6">{{ errors.entry }}</p>

      <div class="w-[100px] mx-auto">
        <button @click="keywordRegister" class="w-full py-1 border border-[#a16a00] rounded bg-[#a16a00] hover:bg-[#8c5d00] text-white transition cursor-pointer">登録</button>
      </div>
    </div>

    <template v-if="useEntry.keywordList.length > 0">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-medium ">キーワードリスト</h2>
      </div>
      <ul class="flex flex-col gap-2">
        <li v-for="item in useEntry.keywordList" v-bind:key="item.id" class="grid sm:grid-cols-[auto_100px] gap-5 sm:gap-3 border border-slate-500 p-3">

          <template v-if="editingId === item.id">
            <div class="flex flex-col gap-2">
              <div class="flex flex-wrap justify-between sm:justify-normal sm:gap-4">
                <template v-for="item in BOOK_SIZES" :key="item.value">
                  <label class="flex items-center gap-1">
                    <input type="radio" v-model="editSize" :value="item.value" :ref="el => { if (item.value === editSize) editRadioRef = el as HTMLInputElement }" />{{ item.label }}</label>
                </template>
              </div>
              <p><label>
                書籍名: <input v-model="editTitle" type="text" class="border rounded p-1 w-full" />
              </label></p>
              <p><label>
                著者名: <input v-model="editAuthor" type="text" class="border rounded p-1 w-full" />
              </label></p>
              <p v-if="errors.edit" class="text-red-500 text-sm">{{ errors.edit }}</p>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-col items-start gap-1">
            <p class="inline-block border border-violet-500 text-violet-500 mb-1 px-3 rounded-full text-sm font-semibold">{{ BOOK_SIZES.find(s => s.value === item.size)?.label }}</p>
            <p v-if="item.title" class="text-lg"><span class="text-base font-bold mr-1">書籍名:</span>{{ item.title }}</p>
            <p v-if="item.author" class="text-lg"><span class="text-base font-bold mr-1">著者名:</span>{{ item.author }}</p>
            </div>
          </template>

          <div class="flex flex-row-reverse sm:flex-col sm:justify-center sm:items-center gap-4">
            <template v-if="editingId === item.id">
              <button @click="saveKeywordSet(item.id)" class="w-[100px] p-1 border border-[#a16a00] rounded bg-[#a16a00] hover:bg-[#8c5d00] text-white transition cursor-pointer">保存</button>
              <button @click="cancel" class="hover:underline cursor-pointer">キャンセル</button>
            </template>
            <template v-else>
              <button @:click="editKeywordSet(item)" class="w-[100px] p-1 border border-[#a16a00] hover:bg-[#fff2e0] rounded text-[#a16a00] transition cursor-pointer">編集</button>
              <DeleteButton :color="'#ff907a'" @:click="deleteKeywordSet(item.id)" />
            </template>
          </div>
        </li>
      </ul>
    </template>

    <transition name="fade" appear>
      <div v-if="showMsg" @:click="showMsg = !showMsg" class="fixed inset-x-0 bottom-[50%] sm:bottom-0 w-full bg-[#008b8b]/70 text-white text-center">変更を保存しました<span class="fixed right-0 bottom-[50%] sm:bottom-[1px]"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></span></div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>
