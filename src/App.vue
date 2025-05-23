<script setup>
import { useToastStore } from '@/stores/toastStore'
import Toast from '@/components/base/Toast.vue'

const { toasts } = useToastStore()
</script>

<template>
  <RouterView />
  <div class="toast-container">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :title="toast.title"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
    />
  </div>
</template>

<style>
.toast-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none;
}
</style>
