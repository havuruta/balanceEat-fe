import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function show({ title, message = '', type = 'success', duration = 3000 }) {
    const id = Date.now()
    toasts.value.push({ id, title, message, type, duration })
    
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  function remove(id) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    show,
    remove
  }
}) 