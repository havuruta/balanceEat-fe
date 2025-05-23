<template>
  <div class="base-select">
    <label v-if="label" class="base-select__label">{{ label }}</label>
    <select
      class="base-select__field"
      v-model="selectValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', selectValue)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <div v-if="error" class="base-select__error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  modelValue: String,
  label: String,
  options: Array,
  error: String,
  disabled: Boolean,
})
const selectValue = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (selectValue.value = v),
)
</script>

<style scoped>
.base-select {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.base-select__label {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.2rem;
}
.base-select__field {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  background: #f5f5f5;
  outline: none;
}
.base-select__field:focus {
  border-color: #22a366;
  background: #fff;
}
.base-select__error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.1rem;
}
</style>
