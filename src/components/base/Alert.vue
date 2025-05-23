<template>
  <div v-if="show" :class="['alert', type]">
    <span>{{ message }}</span>
    <button class="alert-close" @click="show = false"><Icon name="close" /></button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Icon from '../Icon.vue'

const props = defineProps({
  type: { type: String, default: 'info' }, // info, success, error, warning
  message: String,
  modelValue: Boolean,
})
const show = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (show.value = v),
)
</script>

<style scoped>
.alert {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  margin: 0.5rem 0;
  font-size: 1rem;
  position: relative;
}
.alert.info {
  background: #e3f2fd;
  color: #1976d2;
}
.alert.success {
  background: #e6f4ea;
  color: #22a366;
}
.alert.error {
  background: #fdecea;
  color: #e74c3c;
}
.alert.warning {
  background: #fff4e5;
  color: #ff9800;
}
.alert-close {
  background: none;
  border: none;
  color: #888;
  font-size: 1.2rem;
  cursor: pointer;
  position: absolute;
  right: 1rem;
  top: 1rem;
}
</style>
