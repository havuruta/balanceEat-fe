<template>
  <BaseInput
    :label="label"
    :placeholder="placeholder"
    :error="error"
    :type="show ? 'text' : 'password'"
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <template #right>
      <span class="pw-icon" @click="show = !show">
        <Icon :name="show ? 'eye-off' : 'eye'" />
      </span>
    </template>
  </BaseInput>
</template>

<script setup>
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'
import Icon from './Icon.vue'
const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  error: String,
})
const show = ref(false)
</script>

<style scoped>
.pw-icon {
  position: absolute;
  right: 1rem;
  cursor: pointer;
  color: #aaa;
  font-size: 1.2rem;
}
</style>
