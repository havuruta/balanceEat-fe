<template>
  <BaseModal :model-value="show" @close="$emit('update:show', false)" size="lg">
    <template #header>
      <h3 class="modal-title">{{ date }} 식단 상세</h3>
    </template>
    <template #default>
      <div class="diet-detail-container">
        <div class="diet-list">
          <h4>식단 목록</h4>
          <div v-for="mealType in ['BREAKFAST', 'LUNCH', 'DINNER']" :key="mealType" class="meal-section">
            <div class="meal-section-header">{{ getMealTypeLabel(mealType) }}</div>
            <template v-if="dietSummary[mealType] && dietSummary[mealType].length">
              <div v-for="diet in dietSummary[mealType]" :key="diet.id" class="diet-item">
                <div class="diet-info">
                  <span class="food-name">{{ diet.foodName }}</span>
                  <span class="amount">{{ diet.amount }}g</span>
                </div>
                <div class="diet-actions">
                  <BaseButton color="primary" size="sm" @click="$emit('update', diet)">수정</BaseButton>
                  <BaseButton color="danger" size="sm" @click="$emit('delete', diet)">삭제</BaseButton>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="no-record">기록 정보가 없어요! 등록해주세요</div>
            </template>
          </div>
          <div class="add-meal-buttons">
          <BaseButton
              color="secondary"
            size="sm"
              @click="$emit('add')"
              style="width: 100%;"
          >
              추가하기
          </BaseButton>
          </div>
        </div>
        <div class="nutrition-analysis">
          <h4>영양 분석</h4>
          <div class="nutrition-chart">
            <NutrientPieChart :summary="dietSummary.total" />
          </div>
          <div class="nutrition-details">
            <div class="nutrition-item">
              <span class="label">단백질</span>
              <span class="value">{{ dietSummary.total.protein }}g</span>
            </div>
            <div class="nutrition-item">
              <span class="label">지방</span>
              <span class="value">{{ dietSummary.total.fat }}g</span>
            </div>
            <div class="nutrition-item">
              <span class="label">탄수화물</span>
              <span class="value">{{ dietSummary.total.carbohydrates }}g</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import BaseModal from '@/components/base/Modal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import NutrientPieChart from './NutrientPieChart.vue'

const props = defineProps({
  show: Boolean,
  date: String,
  dietSummary: {
    type: Object,
    default: () => ({
      BREAKFAST: [],
      LUNCH: [],
      DINNER: [],
      total: { protein: 0, fat: 0, carbohydrates: 0 }
    })
  }
})

defineEmits(['update:show', 'update', 'delete', 'add'])

function getMealTypeLabel(type) {
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
</script>

<style scoped>
.diet-detail-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 1rem;
}

.diet-list {
  border-right: 1px solid #eee;
  padding-right: 2rem;
}

.meal-section {
  margin-bottom: 1.5rem;
}
.meal-section-header {
  font-size: 1.05rem;
  font-weight: 600;
  color: #4a90e2;
  margin-bottom: 0.5rem;
}
.no-record {
  color: #aaa;
  font-size: 0.98rem;
  padding: 0.7rem 0 1.2rem 0;
}

.nutrition-analysis {
  padding-left: 1rem;
}

h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2d3a4b;
}

.diet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.diet-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.food-name {
  color: #2d3a4b;
}

.amount {
  color: #666;
}

.diet-actions {
  display: flex;
  gap: 0.5rem;
}

.add-meal-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.nutrition-chart {
  margin-bottom: 1.5rem;
}

.nutrition-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
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
  .diet-detail-container {
    grid-template-columns: 1fr;
  }
  
  .diet-list {
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-right: 0;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }
  
  .nutrition-analysis {
    padding-left: 0;
  }
}
</style>
