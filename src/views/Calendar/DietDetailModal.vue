<template>
  <BaseModal :model-value="show" @close="$emit('update:show', false)">
    <template #default>
      <h3 class="detail-title">{{ date }} 식단 상세</h3>
      <div v-for="meal in mealTypes" :key="meal" class="meal-section">
        <div class="meal-header">
          <h4 class="meal-label">{{ mealLabel(meal) }}</h4>
          <BaseButton
            class="add-btn"
            color="primary"
            size="sm"
            style="border-radius: 50%; padding: 0.3rem 0.6rem; min-width: 32px"
            @click="$emit('add', meal)"
          >
            <span style="font-size: 1.3rem; line-height: 1">+</span>
          </BaseButton>
        </div>
        <div v-if="dietsByMeal[meal] && dietsByMeal[meal].length" class="diet-list">
          <div v-for="diet in dietsByMeal[meal]" :key="diet.id" class="diet-row">
            <span class="food-name">{{ diet.foodName }}</span>
            <BaseInput
              v-if="editId === diet.id"
              v-model="editAmount"
              type="number"
              style="width: 80px; min-width: 80px"
            />
            <span v-else class="amount">{{ diet.amount }}g</span>
            <div class="row-btns">
              <BaseButton
                v-if="editId !== diet.id"
                color="primary"
                size="sm"
                @click="startEdit(diet)"
                ><i class="fa fa-edit"></i> 수정</BaseButton
              >
              <BaseButton v-else color="primary" size="sm" @click="saveEdit(diet)"
                ><i class="fa fa-check"></i> 저장</BaseButton
              >
              <BaseButton v-if="editId === diet.id" color="secondary" size="sm" @click="cancelEdit"
                ><i class="fa fa-times"></i> 취소</BaseButton
              >
              <BaseButton color="danger" size="sm" @click="deleteDiet(diet)"
                ><i class="fa fa-trash"></i> 삭제</BaseButton
              >
            </div>
          </div>
        </div>
        <div v-else class="no-diet">식단 없음</div>
      </div>
      <div class="modal-actions">
        <BaseButton color="secondary" @click="$emit('update:show', false)">닫기</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from '@/components/base/Modal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

const props = defineProps({
  show: Boolean,
  diets: Array, // [{id, foodName, amount, mealType, ...}]
  date: String,
})
const emit = defineEmits(['update:show', 'update', 'delete', 'add'])

const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER']
function mealLabel(type) {
  switch (type) {
    case 'BREAKFAST':
      return '아침'
    case 'LUNCH':
      return '점심'
    case 'DINNER':
      return '저녁'
    default:
      return type
  }
}
const dietsByMeal = computed(() => {
  const result = { BREAKFAST: [], LUNCH: [], DINNER: [] }
  if (props.diets) {
    props.diets.forEach((diet) => {
      if (result[diet.mealType]) result[diet.mealType].push(diet)
    })
  }
  return result
})

const editId = ref(null)
const editAmount = ref('')
function startEdit(diet) {
  editId.value = diet.id
  editAmount.value = diet.amount
}
function saveEdit(diet) {
  emit('update', { ...diet, amount: Number(editAmount.value) })
  editId.value = null
  editAmount.value = ''
}
function cancelEdit() {
  editId.value = null
  editAmount.value = ''
}
function deleteDiet(diet) {
  emit('delete', diet)
}
</script>

<style scoped>
.detail-title {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
}
.meal-section {
  margin-bottom: 1.5rem;
}
.meal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.7rem;
}
.meal-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a90e2;
}
.add-btn {
  margin-left: 0.5rem;
}
.diet-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.diet-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: #f7fafd;
  border-radius: 7px;
  padding: 0.7rem 1rem;
  min-width: 600px;
}
.food-name {
  font-weight: 500;
  min-width: 90px;
}
.amount {
  font-size: 1rem;
  color: #333;
  min-width: 50px;
}
.row-btns {
  display: flex;
  gap: 0.5rem;
  min-width: 220px;
}
.no-diet {
  color: #aaa;
  font-size: 1rem;
  margin-left: 1rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}
</style>
