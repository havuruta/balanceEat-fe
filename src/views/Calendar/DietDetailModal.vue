<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ formatDate(date) }} 식단</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="diet-list-section">
          <div class="meal-sections">
            <div v-for="mealType in mealTypes" :key="mealType.value" class="meal-section">
              <h3>{{ mealType.label }}</h3>
              <div v-if="getMealDiets(mealType.value).length > 0" class="meal-items">
                <div v-for="diet in getMealDiets(mealType.value)" :key="diet.id" class="meal-item">
                  <div class="food-info">
                    <span class="food-name">{{ diet.foodName }}</span>
                    <template v-if="editingId === diet.id">
                      <input v-model="editingAmount" type="number" min="1" style="width:60px; margin-left:8px;" />
                      <button @click="saveEdit(diet)" class="edit-btn">저장</button>
                      <button @click="cancelEdit" class="cancel-btn">취소</button>
                    </template>
                    <template v-else>
                      <span class="amount">{{ diet.amount }}g</span>
                      <div class="action-btns">
                        <button @click="startEdit(diet)" class="edit-btn">수정</button>
                        <button @click="deleteDiet(diet)" class="delete-btn">삭제</button>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <div v-else class="no-meal">
                등록된 식단이 없습니다
              </div>
            </div>
          </div>
        </div>
        <div class="summary-section">
          <h2>영양소 요약</h2>
          <div class="summary-content">
            <div class="summary-item">
              <h3>총 칼로리</h3>
              <div class="value">{{ Math.round(dietSummary.totalCalories) }}kcal</div>
            </div>
            <div class="summary-item">
              <h3>단백질</h3>
              <div class="value">{{ Math.round(dietSummary.totalProtein) }}g</div>
            </div>
            <div class="summary-item">
              <h3>지방</h3>
              <div class="value">{{ Math.round(dietSummary.totalFat) }}g</div>
            </div>
            <div class="summary-item">
              <h3>탄수화물</h3>
              <div class="value">{{ Math.round(dietSummary.totalCarbohydrates) }}g</div>
            </div>
          </div>
          <div class="chart-section">
            <NutrientPieChart :summary="{
              protein: dietSummary.totalProtein,
              fat: dietSummary.totalFat,
              carbohydrates: dietSummary.totalCarbohydrates
            }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, watch, watchEffect } from 'vue'
import axiosInstance from '@/utils/axios'
import NutrientPieChart from '@/views/Calendar/NutrientPieChart.vue'

const props = defineProps({
  isOpen: Boolean,
  date: String
})
const { isOpen, date } = toRefs(props)
const emit = defineEmits(['close'])

const diets = ref([])
const dietSummary = ref({
  totalCalories: 0,
  totalProtein: 0,
  totalFat: 0,
  totalCarbohydrates: 0
})

const editingId = ref(null)
const editingAmount = ref('')

const mealTypes = [
  { value: 'BREAKFAST', label: '아침' },
  { value: 'LUNCH', label: '점심' },
  { value: 'DINNER', label: '저녁' },
  { value: 'SNACK', label: '간식' },
  { value: 'NIGHT', label: '야식' }
]

const getMealDiets = (mealType) => {
  return diets.value.filter(diet => diet.mealType === mealType)
}

const formatDate = (dateString) => {
  const dateObj = new Date(dateString)
  return `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`
}

const closeModal = () => {
  emit('close')
}

const fetchDietData = async () => {
  if (!date.value) {
    console.log('[fetchDietData] date.value가 없습니다:', date.value)
    return
  }
  console.log('[fetchDietData] API 요청 시작:', date.value)
  try {
    const [detailResponse, summariesResponse] = await Promise.all([
      axiosInstance.get(`/api/diet/detail?date=${date.value}`),
      axiosInstance.get(`/api/diet/summaries?start=${date.value}&end=${date.value}`)
    ])
    console.log('[fetchDietData] API 응답:', {
      detail: detailResponse.data,
      summaries: summariesResponse.data
    })
    const allDiets = [
      ...detailResponse.data.breakfast.map(diet => ({ ...diet, mealType: 'BREAKFAST' })),
      ...detailResponse.data.lunch.map(diet => ({ ...diet, mealType: 'LUNCH' })),
      ...detailResponse.data.dinner.map(diet => ({ ...diet, mealType: 'DINNER' })),
      ...detailResponse.data.snack?.map(diet => ({ ...diet, mealType: 'SNACK' })),
      ...detailResponse.data.night?.map(diet => ({ ...diet, mealType: 'NIGHT' }))
    ]
    diets.value = allDiets
    const summary = summariesResponse.data[0]
    dietSummary.value = {
      totalCalories: summary.totalCalories,
      totalProtein: summary.totalProtein,
      totalFat: summary.totalFat,
      totalCarbohydrates: summary.totalCarbohydrates
    }
  } catch (error) {
    console.error('[fetchDietData] API 요청 실패:', error)
  }
}

const startEdit = (diet) => {
  editingId.value = diet.id
  editingAmount.value = diet.amount
}

const cancelEdit = () => {
  editingId.value = null
  editingAmount.value = ''
}

const saveEdit = async (diet) => {
  try {
    await axiosInstance.put(`/api/diet/update/${diet.id}`, {
      amount: editingAmount.value
    })
    editingId.value = null
    editingAmount.value = ''
    fetchDietData()
  } catch (e) {
    alert('수정 실패')
  }
}

const deleteDiet = async (diet) => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  try {
    await axiosInstance.delete(`/api/diet/delete/${diet.id}`)
    fetchDietData()
  } catch (e) {
    alert('삭제 실패')
  }
}

watchEffect(() => {
  console.log('[watchEffect] 상태 변경:', { isOpen: isOpen.value, date: date.value })
  if (isOpen.value && date.value) {
    fetchDietData()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  gap: 2rem;
}

.diet-list-section {
  flex: 2;
}

.summary-section {
  flex: 1;
}

.summary-section h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.summary-item {
  text-align: center;
  padding: 0.6rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.summary-item h3 {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}

.summary-item .value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.chart-section {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 0.8rem;
  margin-top: 0.8rem;
}

.meal-section {
  margin-bottom: 2rem;
}

.meal-section h3 {
  color: #666;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.meal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
}

.food-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.food-name {
  flex: 1;
  text-align: left;
}

.amount {
  min-width: 48px;
  text-align: right;
  margin-left: 8px;
}

.nutrition-info {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.no-meal {
  color: #999;
  font-style: italic;
  padding: 0.8rem;
}

.action-btns {
  margin-left: auto;
  display: flex;
  gap: 0.3rem;
}

.edit-btn, .delete-btn, .cancel-btn {
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background 0.15s;
}

.delete-btn {
  color: #e74c3c;
}

.edit-btn:hover, .delete-btn:hover, .cancel-btn:hover {
  background: #f0f4fa;
}
</style> 