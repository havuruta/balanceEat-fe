<template>
  <BaseModal :model-value="show" @close="$emit('update:show', false)" :style="{ zIndex: 3000 }">
    <template #default>
      <form class="diet-form" @submit.prevent>
        <h3 class="form-title">식단 추가하기</h3>
        <div class="form-row">
          <BaseInput
            label="날짜"
            type="date"
            v-model="dietForm.date"
            :placeholder="'날짜를 선택하세요'"
            style="flex: 1; min-width: 0"
          />
          <BaseSelect
            label="식사 구분"
            v-model="dietForm.mealType"
            :options="mealTypeOptions"
            style="flex: 1; min-width: 0"
          />
        </div>
        <div class="form-group">
          <label class="form-label">음식 검색</label>
          <div class="search-group">
            <BaseInput
              v-model="dietForm.foodSearch"
              placeholder="음식 이름을 입력하세요"
              style="flex: 1; min-width: 0"
            />
            <BaseButton color="secondary" type="button" @click="openNutritionModal"
              >검색</BaseButton
            >
          </div>
        </div>
        <div class="form-row">
          <BaseInput
            label="양 (g)"
            type="number"
            v-model="dietForm.amount"
            placeholder="예: 100"
            style="flex: 1; min-width: 0"
          />
          <BaseInput
            label="메모"
            v-model="dietForm.note"
            placeholder="메모를 입력하세요"
            style="flex: 1; min-width: 0"
          />
        </div>
        <div v-if="selectedNutrition" class="nutrition-info">
          <h4>영양 정보</h4>
          <div class="nutrition-grid">
            <div class="nutrition-item">
              <span class="label">칼로리</span>
              <span class="value">{{ calculatedNutrition.calories }} kcal</span>
            </div>
            <div class="nutrition-item">
              <span class="label">단백질</span>
              <span class="value">{{ calculatedNutrition.protein }} g</span>
            </div>
            <div class="nutrition-item">
              <span class="label">지방</span>
              <span class="value">{{ calculatedNutrition.fat }} g</span>
            </div>
            <div class="nutrition-item">
              <span class="label">탄수화물</span>
              <span class="value">{{ calculatedNutrition.carbohydrates }} g</span>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <BaseButton color="secondary" @click="$emit('update:show', false)">취소</BaseButton>
          <BaseButton color="primary" @click="submitDiet">저장</BaseButton>
        </div>
      </form>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCalendarStore } from '@/stores/calendarStore'
import BaseModal from '@/components/base/Modal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

const props = defineProps({
  show: Boolean,
  selectedNutrition: Object,
  mealType: {
    type: String,
    default: 'BREAKFAST',
  },
})
const emit = defineEmits(['update:show', 'refresh', 'update:selectedNutrition'])
const calendarStore = useCalendarStore()

const mealTypeOptions = [
  { value: 'BREAKFAST', label: '아침' },
  { value: 'LUNCH', label: '점심' },
  { value: 'DINNER', label: '저녁' },
]
const dietForm = ref({
  date: new Date().toISOString().split('T')[0],
  mealType: 'BREAKFAST',
  foodSearch: '',
  amount: '',
  note: '',
})

watch(
  () => props.selectedNutrition,
  (val) => {
    if (val) dietForm.value.foodSearch = val.name
  },
)

watch(
  () => props.show,
  (show) => {
    if (show) {
      dietForm.value.mealType = props.mealType
    }
  },
)

const calculatedNutrition = computed(() => {
  if (!props.selectedNutrition || !dietForm.value.amount)
    return {
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
    }
  const ratio = Number(dietForm.value.amount) / 100
  return {
    calories: (props.selectedNutrition.calories * ratio).toFixed(1),
    protein: (props.selectedNutrition.protein * ratio).toFixed(1),
    fat: (props.selectedNutrition.fat * ratio).toFixed(1),
    carbohydrates: (props.selectedNutrition.carbohydrates * ratio).toFixed(1),
  }
})

function openNutritionModal() {
  calendarStore.showNutritionModal = true
}

async function submitDiet() {
  if (!props.selectedNutrition) {
    alert('음식을 선택해주세요.')
    return
  }
  if (!dietForm.value.amount || dietForm.value.amount <= 0) {
    alert('올바른 양을 입력해주세요.')
    return
  }
  // ...API 호출 및 저장 로직...
  emit('refresh')
  emit('update:show', false)
}
</script>

<style scoped>
.diet-form {
  padding: 1rem;
  min-width: 600px;
  z-index: 900;
}
.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3a4b;
  margin-bottom: 1.5rem;
  text-align: center;
}
.form-row {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
}
.form-group {
  margin-bottom: 1.2rem;
}
.form-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}
.search-group {
  display: flex;
  gap: 0.7rem;
}
.nutrition-info {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: #f8fafc;
  border-radius: 12px;
}
.nutrition-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3a4b;
  margin-bottom: 1rem;
}
.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.nutrition-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.nutrition-item .label {
  font-size: 0.85rem;
  color: #64748b;
}
.nutrition-item .value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3a4b;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2.2rem;
}
@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0.7rem;
  }
  .search-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  .form-actions {
    flex-direction: column;
    gap: 0.7rem;
  }
}
:deep(.fc-event) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
}
</style>
