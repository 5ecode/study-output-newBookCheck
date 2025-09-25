<!-- src/components/DeleteButton.vue -->
<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';

/* props
---------------------------------- */
const props = defineProps<{
  color?: '#ff907a' | '#c88500'
}>();

/* emit
---------------------------------- */
const emit = defineEmits<{
  (e: 'clicked'): void
}>();

/* constant
---------------------------------- */
const baseClass = 'p-1 hover:text-[#ff6547] rounded transition cursor-pointer';
</script>

<template>
  <button @click="$emit('clicked')" :class="[baseClass, props.color === '#ff907a' ? 'text-[#ff907a]' : 'text-[#c88500]']" aria-label="削除"><Trash2 /></button>
</template>

