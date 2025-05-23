<template>
  <button :class="['base-btn', color, { full: full }]" :disabled="disabled" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  color: { type: String, default: 'primary' }, // primary, secondary, danger 등
  full: Boolean,
  disabled: Boolean,
})
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
}
.base-btn.primary {
  background: #22a366;
  color: #fff;
}
.base-btn.primary:hover {
  background: #1e8c5a;
}
.base-btn.secondary {
  background: #007bff;
  color: #fff;
}
.base-btn.secondary:hover {
  background: #0056b3;
}
.base-btn.danger {
  background: #e74c3c;
  color: #fff;
}
.base-btn.danger:hover {
  background: #c0392b;
}
.base-btn.full {
  width: 100%;
}
.base-btn:disabled {
  background: #ccc;
  color: #fff;
  cursor: not-allowed;
}
</style>
