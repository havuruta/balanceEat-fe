<template>
  <div class="nutrition-list">
    <BaseSearchTable
      :columns="columns"
      :rows="nutritionData.content"
      :search-options="searchOptions"
      :search-state="searchState"
      :page="page"
      :page-size="pageSize"
      :total-elements="nutritionData.totalElements"
      :selectable="false"
      :food-categories="foodCategories"
      @search="onSearch"
      @page-change="onPageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseSearchTable from '@/components/base/BaseSearchTable.vue'
import { nutritionApi } from '@/api/nutrition'
import { FoodCategory, FoodCategoryLabels } from '@/constants/FoodCategory'

const columns = [
  { key: 'name', label: '음식명' },
  { key: 'calories', label: '칼로리' },
  { key: 'protein', label: '단백질' },
  { key: 'fat', label: '지방' },
  { key: 'carbohydrates', label: '탄수화물' },
  { key: 'category', label: '음식 분류' }
]

const searchOptions = [
  { value: 'name', label: '음식명' },
  { value: 'category', label: '음식 분류' }
]

const foodCategories = Object.entries(FoodCategory).map(([key, value]) => ({
  value,
  label: FoodCategoryLabels[value]
}))

const page = ref(0)
const pageSize = ref(10)
const searchState = ref({
  column: 'name',
  keyword: ''
})

const nutritionData = ref({
  content: [],
  totalElements: 0,
  totalPages: 0
})

const fetchNutritions = async () => {
  try {
    const response = await nutritionApi.getAllNutritions(page.value, pageSize.value)
    nutritionData.value = response
  } catch (error) {
    console.error('영양 정보를 불러오는데 실패했습니다:', error)
  }
}

const onSearch = async ({ column, keyword }) => {
  if (searchState.value.column !== column || searchState.value.keyword !== keyword) {
    page.value = 0;
  }
  searchState.value = { column, keyword }
  try {
    let response
    if (column === 'name') {
      response = await nutritionApi.searchNutritions(keyword, null, page.value, pageSize.value)
    } else if (column === 'category') {
      response = await nutritionApi.searchNutritions(null, keyword, page.value, pageSize.value)
    }
    nutritionData.value = response || { content: [], totalElements: 0, totalPages: 0 }
  } catch (error) {
    nutritionData.value = { content: [], totalElements: 0, totalPages: 0 }
  }
}

const onPageChange = async (newPage) => {
  page.value = newPage
  await onSearch({ column: searchState.value.column, keyword: searchState.value.keyword })
}

onMounted(() => {
  fetchNutritions()
})
</script>

<style scoped>
.nutrition-list {
  padding: 20px;
}
</style>

