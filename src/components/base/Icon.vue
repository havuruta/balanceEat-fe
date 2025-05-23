<template>
  <span v-if="icon" v-html="icon" :style="style" />
  <slot v-else />
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  name: String,
  style: [String, Object],
})
const icons = {
  eye: `<svg width="1.3em" height="1.3em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
  'eye-off': `<svg width="1.3em" height="1.3em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.38 0 2.63-.83 3.16-2.03"/></svg>`,
  close: `<svg width="1.3em" height="1.3em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
}
const icon = computed(() => icons[props.name] || null)
</script>
