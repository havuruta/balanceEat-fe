<template>
  <div class="pagination">
    <button :disabled="page === 1" @click="$emit('update:page', page - 1)">&lt;</button>
    <span>{{ page }} / {{ total }}</span>
    <button :disabled="page === total" @click="$emit('update:page', page + 1)">&gt;</button>
  </div>
</template>

<script setup>
const props = defineProps({
  page: { type: Number, default: 1 },
  total: { type: Number, default: 1 },
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  margin: 1.5rem 0;
}
.pagination button {
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  color: #333;
}
.pagination button:disabled {
  background: #eee;
  color: #bbb;
  cursor: not-allowed;
}
</style>
