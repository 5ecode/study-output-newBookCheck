<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink, RouterView } from 'vue-router';
import { BookCheck, SquarePen, Library, CircleStar } from 'lucide-vue-next';

/* constant
---------------------------------- */
const route = useRoute();
const baseStyle = 'flex flex-col items-center w-[25%] sm:w-full pt-[4px] sm:rounded text-white transition';
const activeStyle = 'bg-[#664400]';
const hoverStyle = 'hover:bg-white hover:text-[#a16a00]';

/* computed
---------------------------------- */
// Homeページかどうか
const isHome = computed(() => route.name === 'Home');

// 本棚ページかどうか
const isBookShelf = computed(() => route.name === 'BookShelf');

// 保留ページかどうか
const isWishlist = computed(() => route.name === 'Wishlist');

// 登録ページかどうか
const isEntry = computed(() => route.name === 'Entry');

</script>

<template>
  <header class="fixed top-0 inset-x-0 bg-[#a16a00] z-20">
    <div class="flex justify-between items-center max-w-4xl m-auto px-2 py-1 gap-5">
      <h1 class="text-lg text-white font-bold">NewBookCheck</h1>

      <nav aria-label="メインナビゲーション" class="flex inset-x-0 bottom-0 fixed sm:static sm:grow sm:gap-1 bg-[#a16a00] text-[10px]">
        <RouterLink to="/" :class="[baseStyle, isHome? activeStyle : hoverStyle]" :aria-current="isHome ? 'page' : undefined"><BookCheck :size="28" />新刊情報</RouterLink>
        <RouterLink to="/book-Shelf" :class="[baseStyle, isBookShelf? activeStyle : hoverStyle]" :aria-current="isBookShelf ? 'page' : undefined"><Library :size="28" />本棚</RouterLink>
        <RouterLink to="/wishlist" :class="[baseStyle, isWishlist? activeStyle : hoverStyle]" :aria-current="isWishlist ? 'page' : undefined"><CircleStar :size="28" />保留</RouterLink>
        <RouterLink to="/entry" :class="[baseStyle, isEntry? activeStyle : hoverStyle]" :aria-current="isEntry ? 'page' : undefined"><SquarePen :size="26" />キーワード登録</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
a:focus-visible{
  outline: 1px solid #fff;
  outline-offset: -3px;
}
</style>
