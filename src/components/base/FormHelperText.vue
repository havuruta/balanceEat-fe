<template>
  <div class="helper-text">
    <slot />
    <a v-if="link" :href="link" class="helper-link"><slot name="link" /></a>
  </div>
</template>

<script setup>
const props = defineProps({
  link: String,
})
</script>

<style scoped>
.helper-text {
  font-size: 0.95rem;
  color: #888;
  margin-top: 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.helper-link {
  color: #007bff;
  text-decoration: underline;
  font-size: 0.95rem;
}
</style>
