<template>
  <BaseModal :model-value="show" @close="handleModalClose" :style="{ zIndex: 3000 }">
    <template #header>
      <h3 class="modal-title">식단 추가</h3>
    </template>
    <template #default>
      <div class="add-diet-modal-flex">
        <!-- 좌측: 추가된 음식 리스트 -->
        <div class="added-foods-list">
          <h4>추가된 음식</h4>
          <div v-if="addedFoods.length === 0" class="empty-list">아직 추가된 음식이 없습니다.</div>
          <ul>
            <li v-for="(food, idx) in addedFoods" :key="idx" class="added-food-item">
              <span>{{ food.name }} ({{ food.amount }}g)</span>
              <button class="remove-btn" @click="removeFood(idx)">삭제</button>
            </li>
          </ul>
          <!-- 추가된 음식의 영양정보 표시 -->
          <div class="nutrition-summary">
            <h4>현재까지 추가한 음식의 영양정보</h4>
            <table class="nutrition-table">
              <thead>
                <tr>
                  <th>칼로리 (kcal)</th>
                  <th>단백질 (g)</th>
                  <th>지방 (g)</th>
                  <th>탄수화물 (g)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ totalNutrition.calories }}</td>
                  <td>{{ totalNutrition.protein }}</td>
                  <td>{{ totalNutrition.fat }}</td>
                  <td>{{ totalNutrition.carbs }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- 우측: 음식 추가 폼 -->
        <div class="add-food-form">
          <div class="form-group">
            <label class="form-label">날짜</label>
            <BaseInput
              type="date"
              v-model="selectedDate"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label class="form-label">식사 시간</label>
            <div class="time-selector">
              <input
                type="time"
                v-model="selectedTime"
                class="form-control"
                @change="handleTimeChange"
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">식사 유형</label>
            <div class="meal-type-display">
              <span class="meal-type-label">{{ getMealTypeLabel(currentMealType) }}</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">음식 검색</label>
            <div class="search-group">
              <BaseInput
                v-model="foodSearch"
                placeholder="음식명을 입력하세요"
                @click="openNutritionSearch"
                readonly
              />
              <BaseButton color="primary" @click="openNutritionSearch">검색</BaseButton>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">섭취량 (g)</label>
            <ElInputNumber
              v-model="amount"
              :min="1"
              :max="1000"
              :step="10"
              :precision="0"
              class="amount-input"
              placeholder="섭취량을 입력하세요"
              :controls-position="'right'"
              size="default"
            />
          </div>
          <div class="form-group">
            <label class="form-label">메모</label>
            <BaseInput
              v-model="note"
              type="text"
              placeholder="메모를 입력하세요"
            />
          </div>
          <div class="form-actions">
            <BaseButton color="secondary" @click="handleModalClose">취소</BaseButton>
            <BaseButton color="primary" @click="handleAddButtonClick">추가</BaseButton>
            <BaseButton color="primary" @click="submitAllFoods" :disabled="isSubmitting || addedFoods.length === 0">
              {{ isSubmitting ? '저장 중...' : '저장' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </template>
  </BaseModal>
  <NutritionSearchModal
    :show="showNutritionSearch"
    @update:show="showNutritionSearch = $event"
    :amount="amount"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCalendarStore } from '@/stores/calendarStore'
import { useAuthStore } from '@/stores/authStore'
import BaseModal from '@/components/base/Modal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { ElInputNumber } from 'element-plus'
import NutritionSearchModal from '@/views/Calendar/NutritionSearchModal.vue'
import axiosInstance from '@/utils/axios'
import { API_ROUTES } from '@/config/api'

const MEAL_TYPE = {
  BREAKFAST: { label: '아침', start: '05:00', end: '10:00' },
  LUNCH: { label: '점심', start: '11:00', end: '15:00' },
  DINNER: { label: '저녁', start: '17:00', end: '21:00' },
  SNACK: { label: '간식', start: '10:00', end: '17:00' },
  NIGHT: { label: '야식', start: '21:00', end: '05:00' }
}

const props = defineProps({
  show: Boolean,
  selectedNutrition: Object,
  mealType: String,
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  }
})

const emit = defineEmits(['update:show', 'refresh', 'update:mealType'])

const calendarStore = useCalendarStore()
const authStore = useAuthStore()
const selectedFood = ref(null)
const foodSearch = ref('')
const amount = ref(100)
const note = ref('')
const selectedTime = ref(new Date().toTimeString().slice(0, 5))
const selectedDate = ref(props.date)
const currentMealType = ref(props.mealType)
const isSubmitting = ref(false)
const addedFoods = ref([])
const showNutritionSearch = ref(false)

// 모달 닫기 처리
function handleModalClose() {
  if (!isSubmitting.value) {
    emit('update:show', false)
  }
}

// store의 selectedFood를 감시
watch(() => calendarStore.selectedFood, (newFood) => {
  console.log('[watch] store의 selectedFood 변경:', newFood)
  if (newFood && !isSubmitting.value) {
    handleFoodSelection(newFood)
    calendarStore.showNutritionModal = false
  }
}, { immediate: true })

// 영양소 검색 모달 열기
function openNutritionSearch() {
  console.log('[openNutritionSearch] 영양소 검색 모달 열기')
  showNutritionSearch.value = true
}

// 영양소 검색 모달 닫기
function closeNutritionSearch() {
  console.log('[closeNutritionSearch] 영양소 검색 모달 닫기')
  showNutritionSearch.value = false
}

// 영양소 선택 처리
function handleFoodSelection(food) {
  console.log('[handleFoodSelection] 선택된 음식:', food)
  if (food) {
    selectedFood.value = food
    foodSearch.value = food.name // 음식 이름 표시
    amount.value = 100
    closeNutritionSearch()
    // store 초기화는 여기서 수행
    calendarStore.selectedFood = null
  }
}

// 추가 버튼 클릭 시 호출되는 함수
function handleAddButtonClick() {
  console.log('[handleAddButtonClick] 추가 버튼 클릭')
  console.log('[handleAddButtonClick] 현재 selectedFood:', selectedFood.value)
  
  if (selectedFood.value) {
    addFoodToList()
    // 추가 후 초기화
    selectedFood.value = null
    foodSearch.value = ''
    amount.value = 100
    note.value = ''
  }
}

function addFoodToList() {
  console.log('[addFoodToList] 시작 - selectedFood:', selectedFood.value)
  console.log('[addFoodToList] 시작 - amount:', amount.value)
  console.log('[addFoodToList] 시작 - note:', note.value)
  
  if (!selectedFood.value || !amount.value || amount.value <= 0) {
    console.log('[addFoodToList] 유효성 검사 실패 - selectedFood:', selectedFood.value)
    console.log('[addFoodToList] 유효성 검사 실패 - amount:', amount.value)
    alert('음식명과 섭취량을 올바르게 입력하세요.')
    return
  }
  
  const foodToAdd = {
    ...selectedFood.value,
    nutritionId: selectedFood.value.id,
    foodName: selectedFood.value.name,
    amount: amount.value,
    note: note.value,
    mealType: currentMealType.value,
    dietDate: selectedDate.value,
    mealTime: selectedTime.value
  }
  
  console.log('[addFoodToList] 추가할 음식 데이터:', foodToAdd)
  addedFoods.value.push(foodToAdd)
  console.log('[addFoodToList] 업데이트된 전체 리스트:', addedFoods.value)
  
  console.log('[addFoodToList] 완료')
}

function removeFood(idx) {
  addedFoods.value.splice(idx, 1)
}

const submitAllFoods = async () => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    const diets = addedFoods.value.map(food => ({
      nutritionId: food.id,
      foodName: food.name,
      amount: food.amount.toString(),
      note: food.note || '',
      mealType: food.mealType,
      dietDate: food.dietDate,
      mealTime: food.mealTime
    }))

    const response = await axiosInstance.post(API_ROUTES.DIET.BATCH_ADD, { diets })
    
    if (response.status === 200) {
      alert('식단이 성공적으로 등록되었습니다.')
      addedFoods.value = []
      emit('refresh')
      handleModalClose()
    }
  } catch (error) {
    console.error('식단 등록 중 오류 발생:', error)
    alert(error.response?.data || '식단 등록 중 오류가 발생했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const totalNutrition = computed(() => {
  const sum = addedFoods.value.reduce((acc, food) => {
    const ratio = Number(food.amount) / 100
    acc.calories += (food.calories || 0) * ratio
    acc.protein += (food.protein || 0) * ratio
    acc.fat += (food.fat || 0) * ratio
    acc.carbs += (food.carbohydrates || 0) * ratio
    return acc
  }, { calories: 0, protein: 0, fat: 0, carbs: 0 })
  return {
    calories: +sum.calories.toFixed(1),
    protein: +sum.protein.toFixed(1),
    fat: +sum.fat.toFixed(1),
    carbs: +sum.carbs.toFixed(1)
  }
})

function getMealTypeLabel(type) {
  switch (type) {
    case 'BREAKFAST': return '아침'
    case 'LUNCH': return '점심'
    case 'DINNER': return '저녁'
    case 'SNACK': return '간식'
    case 'NIGHT': return '야식'
    default: return type
  }
}

function handleTimeChange() {
  const hour = parseInt(selectedTime.value.split(':')[0])
  const minute = parseInt(selectedTime.value.split(':')[1])
  const timeValue = hour + minute / 60

  let newMealType = currentMealType.value

  if (timeValue >= 5 && timeValue < 10) {
    newMealType = 'BREAKFAST'
  } else if (timeValue >= 11 && timeValue < 15) {
    newMealType = 'LUNCH'
  } else if (timeValue >= 17 && timeValue < 21) {
    newMealType = 'DINNER'
  } else if (timeValue >= 21 || timeValue < 5) {
    newMealType = 'NIGHT'
  } else {
    newMealType = 'SNACK'
  }

  if (newMealType !== currentMealType.value) {
    currentMealType.value = newMealType
    emit('update:mealType', newMealType)
  }
}

watch(() => props.date, (newDate) => {
  selectedDate.value = newDate
})

watch(() => props.mealType, (newType) => {
  currentMealType.value = newType
})

watch(() => props.show, (newVal) => {
  if (!newVal) {
    foodSearch.value = ''
    amount.value = 100
    note.value = ''
    selectedTime.value = new Date().toTimeString().slice(0, 5)
    selectedDate.value = new Date().toISOString().split('T')[0]
    currentMealType.value = props.mealType
    addedFoods.value = []
    selectedFood.value = null
  } else {
    const now = new Date()
    const timeStr = now.toTimeString().slice(0, 5)
    selectedTime.value = timeStr
    // 식사유형 자동 감지
    const hour = now.getHours()
    const minute = now.getMinutes()
    const timeValue = hour + minute / 60
    if (timeValue >= 5 && timeValue < 10) currentMealType.value = 'BREAKFAST'
    else if (timeValue >= 11 && timeValue < 15) currentMealType.value = 'LUNCH'
    else if (timeValue >= 17 && timeValue < 21) currentMealType.value = 'DINNER'
    else if (timeValue >= 21 || timeValue < 5) currentMealType.value = 'NIGHT'
    else currentMealType.value = 'SNACK'
  }
})
</script>

<style scoped>

nutrition-preview {
  margin-top: 1rem;
  padding: .75rem 1rem;
  background: #f7fafc;
  border-radius: 8px;
  font-size: .92rem;
  line-height: 1.4;
}
.nutrition-preview h4 { margin-bottom: .5rem; font-size: 1rem; }
.nutrition-preview ul  { padding-left: 1rem; list-style: disc; }
.add-diet-modal-flex {
  display: flex;
  gap: 2rem;
  min-height: 400px;
}
.added-foods-list {
  flex: 0 0 300px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  max-width: 330px;
  display: flex;
  flex-direction: column;
}
.added-foods-list h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.added-food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 1rem;
}
.empty-list {
  color: #aaa;
  font-size: 0.98rem;
  margin-bottom: 1rem;
}
.remove-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 0.95rem;
}
.add-food-form {
  flex: 2;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}
.date-time-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.date-time-group .form-group {
  flex: 1;
  margin-bottom: 0;
}
.time-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.time-selector input[type="time"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}
.meal-type-display {
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 8px;
  font-weight: 500;
  color: #4a90e2;
}
.search-group {
  display: flex;
  gap: 0.5rem;
}
.nutrition-info {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
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
  margin-top: 2rem;
}
@media (max-width: 600px) {
  .search-group {
    flex-direction: column;
  }
  .form-actions {
    flex-direction: column;
  }
  .form-actions button {
    width: 100%;
  }
}
.amount-input {
  width: 100%;
  margin-top: 0.5rem;
}
:deep(.el-input-number) {
  width: 100%;
}
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  width: 32px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
}
:deep(.el-input__wrapper) {
  padding: 0 8px;
}
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
}
:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  color: #409eff;
  background-color: #ecf5ff;
}
.nutrition-summary {
  margin-top: 0px;
  padding: 1px;
  background: #f8f9fa;
  border-radius: 8px;
}
.nutrition-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.nutrition-table th, .nutrition-table td {
  padding: 8px;
  border: 1px solid #dee2e6;
  text-align: center;
}
.nutrition-table th {
  background: #e9ecef;
  font-weight: bold;
}
</style>