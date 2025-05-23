<template>
  <BaseModal :model-value="show" @close="closeModal" :style="{ zIndex: 4000 }">
    <template #default>
      <BaseSearchTable
        :columns="nutritionColumns"
        :rows="nutritionFilteredRows"
        :searchOptions="nutritionSearchOptions"
        :page="nutritionPage"
        :pageSize="nutritionPageSize"
        :total="nutritionFilteredRows.length"
        @search="handleNutritionSearch"
        @select="handleNutritionSelect"
        @pageChange="handleNutritionPageChange"
      />
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCalendarStore } from '@/stores/calendarStore'
import BaseModal from '@/components/base/Modal.vue'
import BaseSearchTable from '@/components/base/BaseSearchTable.vue'

const props = defineProps({
  show: Boolean,
})
const emit = defineEmits(['update:show'])
const calendarStore = useCalendarStore()

const nutritionColumns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '식품명' },
  { key: 'calorie', label: '칼로리 (kcal)' },
  { key: 'protein', label: '단백질 (g)' },
  { key: 'fat', label: '지방 (g)' },
  { key: 'carb', label: '탄수화물 (g)' },
  { key: 'category', label: '카테고리' },
]
const nutritionSearchOptions = [
  { value: 'name', label: '식품명' },
  { value: 'category', label: '카테고리' },
]
const nutritionPage = ref(1)
const nutritionPageSize = ref(8)
const nutritionAllRows = ref([
  {
    id: 1,
    name: '국밥_돼지머리',
    calorie: 137,
    protein: 6.7,
    fat: 5.16,
    carb: 15.94,
    category: '밥류',
  },
  {
    id: 2,
    name: '국밥_소대국밥',
    calorie: 75,
    protein: 3.17,
    fat: 2.28,
    carb: 10.38,
    category: '밥류',
  },
  {
    id: 3,
    name: '국밥_콩나물',
    calorie: 52,
    protein: 1.45,
    fat: 0.24,
    carb: 10.93,
    category: '테스트',
  },
  { id: 4, name: '기장밥', calorie: 166, protein: 3.44, fat: 0.57, carb: 36.77, category: '밥류' },
  { id: 5, name: '김밥', calorie: 140, protein: 4.84, fat: 4.55, carb: 19.98, category: '밥류' },
  {
    id: 6,
    name: '김밥_김치',
    calorie: 130,
    protein: 4.3,
    fat: 4.03,
    carb: 19.17,
    category: '밥류',
  },
  {
    id: 7,
    name: '김밥_날치알',
    calorie: 177,
    protein: 6.1,
    fat: 4.26,
    carb: 28.66,
    category: '밥류',
  },
  {
    id: 8,
    name: '김밥_돈가스',
    calorie: 202,
    protein: 5.77,
    fat: 5.81,
    carb: 31.64,
    category: '밥류',
  },
  {
    id: 9,
    name: '김밥_소고기',
    calorie: 179,
    protein: 6.46,
    fat: 5.56,
    carb: 25.78,
    category: '밥류',
  },
  { id: 10, name: '김밥_참치', calorie: 174, protein: 7, fat: 7.22, carb: 20.26, category: '밥류' },
  {
    id: 11,
    name: '김밥_채소',
    calorie: 158,
    protein: 4.6,
    fat: 3.65,
    carb: 26.65,
    category: '밥류',
  },
  {
    id: 12,
    name: '김밥_치즈',
    calorie: 177,
    protein: 6.24,
    fat: 7.03,
    carb: 22.1,
    category: '밥류',
  },
  {
    id: 13,
    name: '김밥_풋고추',
    calorie: 169,
    protein: 4.88,
    fat: 4.41,
    carb: 27.52,
    category: '밥류',
  },
])
const nutritionSearchState = ref({ column: 'name', keyword: '' })

const nutritionFilteredRows = computed(() => {
  if (!nutritionSearchState.value.keyword) return nutritionAllRows.value
  return nutritionAllRows.value.filter((row) => {
    const value = String(row[nutritionSearchState.value.column] || '').toLowerCase()
    return value.includes(nutritionSearchState.value.keyword.toLowerCase())
  })
})

function handleNutritionSearch({ column, keyword }) {
  nutritionSearchState.value = { column, keyword }
  nutritionPage.value = 1
}
function handleNutritionSelect(id) {
  const food = nutritionAllRows.value.find((f) => f.id === id)
  if (food) {
    calendarStore.setSelectedNutrition({
      id: food.id,
      name: food.name,
      calories: food.calorie,
      protein: food.protein,
      fat: food.fat,
      carbohydrates: food.carb,
      category: food.category,
    })
    closeModal()
  }
}
function handleNutritionPageChange(newPage) {
  nutritionPage.value = newPage
}
function closeModal() {
  emit('update:show', false)
  calendarStore.closeNutritionModal()
}
</script>
