<template>
  <div class="diet-detail-view">
    <div class="header">
      <h2>{{ date }} 식단 상세</h2>
      <BaseButton color="primary" @click="goBack">뒤로가기</BaseButton>
    </div>

    <div class="diet-content">
      <div class="diet-list">
        <div v-for="mealType in ['BREAKFAST', 'LUNCH', 'DINNER']" :key="mealType" class="meal-section">
          <h3>{{ getMealTypeLabel(mealType) }}</h3>
          <div v-if="dietSummary[mealType] && dietSummary[mealType].length" class="meal-items">
            <div v-for="diet in dietSummary[mealType]" :key="diet.id" class="diet-item">
              <div class="diet-info">
                <span class="food-name">{{ diet.foodName }}</span>
                <span class="amount">{{ diet.amount }}g</span>
              </div>
              <div class="diet-actions">
                <BaseButton color="primary" size="sm" @click="handleUpdate(diet)">수정</BaseButton>
                <BaseButton color="danger" size="sm" @click="handleDelete(diet)">삭제</BaseButton>
              </div>
            </div>
          </div>
          <div v-else class="no-record">
            기록된 식단이 없습니다.
          </div>
        </div>
      </div>

      <div class="nutrition-analysis">
        <h3>영양 분석</h3>
        <div class="nutrition-chart">
          <NutrientPieChart :summary="analyzeSummary" />
        </div>
        <div class="nutrition-details">
          <div class="nutrition-item">
            <span class="label">단백질</span>
            <span class="value">{{ dietSummary.total?.totalProtein || 0 }}g</span>
          </div>
          <div class="nutrition-item">
            <span class="label">지방</span>
            <span class="value">{{ dietSummary.total?.totalFat || 0 }}g</span>
          </div>
          <div class="nutrition-item">
            <span class="label">탄수화물</span>
            <span class="value">{{ dietSummary.total?.totalCarbohydrates || 0 }}g</span>
          </div>
        </div>
      </div>
    </div>

    <AddDietModal
      v-if="showAddModal"
      :show="showAddModal"
      :selected-date="date"
      :meal-type="selectedMealType"
      @update:show="showAddModal = $event"
      @refresh="fetchDietDetails"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import AddDietModal from '@/views/Calendar/AddDietModal.vue'
import NutrientPieChart from '@/views/Calendar/NutrientPieChart.vue'
import axiosInstance from '@/utils/axios'
import { API_ROUTES } from '@/config/api'

const route = useRoute()
const router = useRouter()
const date = ref(route.query.date || new Date().toISOString().split('T')[0])
const dietSummary = ref({
  BREAKFAST: [],
  LUNCH: [],
  DINNER: [],
  total: {}
})
const showAddModal = ref(false)
const selectedMealType = ref('BREAKFAST')
const analyzeSummary = ref({
  protein: 0,
  fat: 0,
  carbohydrates: 0
})

const fetchDietDetails = async () => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.DIET.DETAIL}?date=${date.value}`)
    if (response.data) {
      const summary = response.data
      dietSummary.value = {
        BREAKFAST: summary.breakfast || [],
        LUNCH: summary.lunch || [],
        DINNER: summary.dinner || [],
        total: {
          totalProtein: summary.totalProtein,
          totalFat: summary.totalFat,
          totalCarbohydrates: summary.totalCarbohydrates
        }
      }
      analyzeSummary.value = {
        protein: summary.totalProtein || 0,
        fat: summary.totalFat || 0,
        carbohydrates: summary.totalCarbohydrates || 0
      }
    }
  } catch (error) {
    console.error('식단 상세 정보를 불러오는데 실패했습니다:', error)
  }
}

const handleUpdate = (diet) => {
  selectedMealType.value = diet.mealType
  showAddModal.value = true
}

const handleDelete = async (diet) => {
  if (!confirm('정말로 이 식단을 삭제하시겠습니까?')) return

  try {
    await axiosInstance.delete(`${API_ROUTES.DIET.DELETE}/${diet.id}`)
    await fetchDietDetails()
  } catch (error) {
    console.error('식단 삭제 중 오류가 발생했습니다:', error)
    alert('식단 삭제 중 오류가 발생했습니다.')
  }
}

const getMealTypeLabel = (type) => {
  switch (type) {
    case 'BREAKFAST': return '아침'
    case 'LUNCH': return '점심'
    case 'DINNER': return '저녁'
    default: return type
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchDietDetails()
})
</script>

<style scoped>
.diet-detail-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.diet-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.meal-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
}

.meal-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3a4b;
  margin-bottom: 1rem;
}

.diet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.diet-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.food-name {
  font-weight: 500;
  color: #2d3a4b;
}

.amount {
  color: #64748b;
}

.diet-actions {
  display: flex;
  gap: 0.5rem;
}

.no-record {
  color: #94a3b8;
  text-align: center;
  padding: 1rem;
}

.nutrition-analysis {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
}

.nutrition-chart {
  margin-bottom: 1.5rem;
}

.nutrition-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.nutrition-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.nutrition-item .label {
  font-size: 0.9rem;
  color: #64748b;
}

.nutrition-item .value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3a4b;
}

@media (max-width: 768px) {
  .diet-content {
    grid-template-columns: 1fr;
  }
  
  .nutrition-analysis {
    margin-top: 1rem;
  }
}
</style> 