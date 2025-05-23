<template>
  <div class="spinner"></div>
</template>

<script setup></script>

<style scoped>
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #22a366;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
