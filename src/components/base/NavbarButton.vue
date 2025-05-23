<template>
  <button 
    class="navbar-button" 
    :class="[color, { full }]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <Icon v-if="icon" :name="icon" class="button-icon" />
    <slot />
  </button>
</template>

<script setup>
import Icon from './Icon.vue'

const props = defineProps({
  color: { type: String, default: 'primary' },
  full: Boolean,
  disabled: Boolean,
  icon: String,
})
</script>

<style scoped>
.navbar-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.navbar-button.full {
  width: 100%;
}

.navbar-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-icon {
  margin-right: 0.5rem;
}

/* 색상 스타일 */
.navbar-button.primary {
  background: #22a366;
  color: white;
}

.navbar-button.primary:hover:not(:disabled) {
  background: #1e8c5a;
}

.navbar-button.secondary {
  background: #fff;
  color: #333;
  border: 1px solid #e5e5e5;
}

.navbar-button.secondary:hover:not(:disabled) {
  background: #f5f5f5;
}

.navbar-button.danger {
  background: #e74c3c;
  color: white;
}

.navbar-button.danger:hover:not(:disabled) {
  background: #c0392b;
}
</style> 