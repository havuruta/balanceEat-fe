<template>
  <label class="toggle">
    <input type="checkbox" v-model="checked" @change="$emit('update:modelValue', checked)" />
    <span class="slider"></span>
    <span class="toggle-label">{{ label }}</span>
  </label>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  modelValue: Boolean,
  label: String,
})
const checked = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (checked.value = v),
)
</script>

<style scoped>
.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.toggle input {
  display: none;
}
.slider {
  width: 36px;
  height: 20px;
  background: #e0e0e0;
  border-radius: 20px;
  position: relative;
  transition: background 0.2s;
}
.toggle input:checked + .slider {
  background: #22a366;
}
.slider::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}
.toggle input:checked + .slider::before {
  transform: translateX(16px);
}
.toggle-label {
  font-size: 0.98rem;
  color: #444;
}
</style>
