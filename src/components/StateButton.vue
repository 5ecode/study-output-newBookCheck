<!-- src/components/StateButton.vue -->
<script setup lang="ts">
import { computed } from 'vue';

/* props
---------------------------------- */
const props = defineProps<{
  isActive?: boolean
}>();

/* emit
---------------------------------- */
const emit = defineEmits<{
  (e: 'clicked'): void
}>();

/* computed
---------------------------------- */
const buttonClass = computed(() => {
  if (props.isActive) {
    return 'bg-[#008b8b] border-[#008b8b] text-white cursor-default';
  }

  return 'hover:bg-[#008b8b] hover:border-[#008b8b] hover:text-white cursor-pointer';
});
</script>

<template>
  <button @click="$emit('clicked')" :class="['px-2 border transition', buttonClass]" >
    <slot />
  </button>
</template>

