<template>
  <div class="auth-form-wrapper">
    <h2 class="auth-title">{{ title }}</h2>
    <p v-if="desc" class="auth-desc">{{ desc }}</p>
    <div class="auth-form-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  desc: String,
})
</script>

<style scoped>
.auth-form-wrapper {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 2.5rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.auth-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
  text-align: center;
}
.auth-desc {
  font-size: 1rem;
  color: #888;
  margin-bottom: 1.5rem;
  text-align: center;
}
.auth-form-content {
  width: 100%;
}
</style>
