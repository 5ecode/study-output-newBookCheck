<!-- src/components/EmptyState.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute} from 'vue-router';
import { BookCheck, Library, CircleStar } from 'lucide-vue-next';

/* props
---------------------------------- */
const props = defineProps<{
  msg: string
}>();

/* constant
---------------------------------- */
const route = useRoute();
const iconSize = 180;

/* computed
---------------------------------- */
const currentIcon = computed(() => {
  switch (route.name) {
  case 'Home':
    return BookCheck;
  case 'BookShelf':
    return Library;
  case 'Wishlist':
    return CircleStar;
  default:
    return null;
  }
});
</script>

<template>
  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
    <div class="flex flex-col justify-center items-center gap-y-3 w-[75vw] h-[75vw] max-w-[300px] max-h-[300px] bg-[rgba(161,106,0,0.2)] rounded text-[#fffaef]">
      <component :is="currentIcon" v-if="currentIcon" :size="iconSize" />

      <p class="text-center text-[#a16a00] font-bold">{{ msg }}</p>
    </div>

    <!-- Rakuten Web Services Attribution Snippet FROM HERE -->
    <a href="https://developers.rakuten.com/" target="_blank">Supported by Rakuten Developers</a>
    <!-- Rakuten Web Services Attribution Snippet TO HERE -->
  </div>
</template>

<style scoped>
a {
  color: #a16a00;
}
a:hover{
  text-decoration: underline;
}
</style>
