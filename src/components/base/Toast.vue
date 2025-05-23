<template>
  <Transition name="slide-fade">
    <div v-if="visible" class="toast" :class="type">
      <div class="toast-icon">
        <Icon :name="icon" />
      </div>
      <div class="toast-content">
        <div class="toast-title">{{ title }}</div>
        <div v-if="message" class="toast-message">{{ message }}</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const visible = ref(false)
const icon = ref('check')

onMounted(() => {
  visible.value = true
  setTimeout(() => {
    visible.value = false
  }, props.duration)
})
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 9999;
  min-width: 300px;
}

.toast-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.toast.success .toast-icon {
  background: #22a366;
  color: white;
}

.toast.error .toast-icon {
  background: #e74c3c;
  color: white;
}

.toast.warning .toast-icon {
  background: #f1c40f;
  color: white;
}

.toast.info .toast-icon {
  background: #3498db;
  color: white;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: 0.9rem;
  color: #666;
}

/* 슬라이드 애니메이션 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  transform: translate(-50%, -100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translate(-50%, -100%);
  opacity: 0;
}
</style> 