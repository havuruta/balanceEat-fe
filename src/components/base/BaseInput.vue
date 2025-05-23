<template>
  <div class="base-input">
    <label v-if="label" class="base-input__label">{{ label }}</label>
    <div class="base-input__wrapper">
      <input
        :type="type"
        :placeholder="placeholder"
        v-model="inputValue"
        :disabled="disabled"
        class="base-input__field"
        @input="$emit('update:modelValue', inputValue)"
      />
      <slot name="right" />
    </div>
    <div v-if="error" class="base-input__error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  error: String,
  type: { type: String, default: 'text' },
  disabled: Boolean,
})
const inputValue = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (inputValue.value = v),
)
</script>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.base-input__label {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.2rem;
}
.base-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.base-input__field {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  background: #f5f5f5;
  outline: none;
}
.base-input__field:focus {
  border-color: #22a366;
  background: #fff;
}
.base-input__error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.1rem;
}
</style>
