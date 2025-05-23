<template>
  <BaseButton :color="color" :full="full" :disabled="disabled" @click="$emit('click')">
    <Icon v-if="icon" :name="icon" style="margin-right: 0.5rem" />
    <slot />
  </BaseButton>
</template>

<script setup>
import BaseButton from './base/BaseButton.vue'
import Icon from './base/Icon.vue'

const props = defineProps({
  color: { type: String, default: 'primary' },
  full: Boolean,
  disabled: Boolean,
  icon: String,
})
</script>

<style scoped>
.base-btn.secondary {
  background: #fff;
  color: #000;
  border: 1px solid #e5e5e5;
}
.base-btn.secondary:hover {
  background: #f5f5f5;
}
.base-btn.danger {
  background: #e74c3c;
  color: #fff;
  border: none;
}
.base-btn.danger:hover {
  background: #c0392b;
}
</style> 