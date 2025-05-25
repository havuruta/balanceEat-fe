<template>
  <BaseModal :model-value="show" @close="$emit('update:show', false)">
    <template #header>
      <h3 class="modal-title">식사 유형 확인</h3>
    </template>
    <template #default>
      <div class="meal-type-confirm">
        <p class="time-info">{{ time }}에 식사를 하셨네요!</p>
        <p class="suggestion">
          이 시간대는 일반적으로 {{ getMealTypeLabel(suggestedType) }} 시간대입니다.
          식사 유형을 선택해주세요.
        </p>
        <div class="meal-type-buttons">
          <BaseButton
            v-for="type in ['MORNING', 'LUNCH', 'DINNER', 'SNACK', 'NIGHT']"
            :key="type"
            :color="type === suggestedType ? 'primary' : 'secondary'"
            @click="$emit('confirm', type)"
          >
            {{ getMealTypeLabel(type) }}
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import BaseModal from '@/components/base/Modal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  show: Boolean,
  suggestedType: String,
  time: String
})

defineEmits(['update:show', 'confirm'])

function getMealTypeLabel(type) {
  switch (type) {
    case 'MORNING':
      return '아침'
    case 'LUNCH':
      return '점심'
    case 'DINNER':
      return '저녁'
    case 'SNACK':
      return '간식'
    case 'NIGHT':
      return '야식'
    default:
      return type
  }
}
</script>

<style scoped>
.meal-type-confirm {
  padding: 1.5rem;
  text-align: center;
}

.time-info {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3a4b;
  margin-bottom: 1rem;
}

.suggestion {
  color: #64748b;
  margin-bottom: 2rem;
}

.meal-type-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.meal-type-buttons button {
  min-width: 100px;
}
</style> 