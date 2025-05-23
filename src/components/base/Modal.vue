<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="$emit('close')">
        <Icon name="close" />
      </button>
      <slot />
    </div>
  </div>
</template>

<script setup>
import Icon from './Icon.vue'
const props = defineProps({
  modelValue: Boolean,
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 10px;
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 95vw;
  position: relative;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: #888;
}
</style>
