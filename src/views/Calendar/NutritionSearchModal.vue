<template>
  <BaseModal :model-value="show" @close="closeModal" :style="{ zIndex: 4000 }">
    <template #default>
      <div class="nutrition-list-modal">
        <BaseSearchTable
          :columns="columns"
          :rows="nutritionData.content"
          :search-options="searchOptions"
          :search-state="searchState"
          :page="page"
          :page-size="pageSize"
          :total-elements="nutritionData.totalElements"
          :food-categories="foodCategories"
          :selectable="true"
          :is-modal="true"
          @search="onSearch"
          @select="onSelect"
          @page-change="onPageChange"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCalendarStore } from '@/stores/calendarStore'
import BaseModal from '@/components/base/Modal.vue'
import BaseSearchTable from '@/components/base/BaseSearchTable.vue'
import { nutritionApi } from '@/api/nutrition'
import { FoodCategory, FoodCategoryLabels } from '@/constants/FoodCategory'

const props = defineProps({
  show: Boolean,
  amount: { type: [Number, String], default: 100 }
})
const emit = defineEmits(['update:show', 'food-picked'])
const calendarStore = useCalendarStore()

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
const searchState = ref({ column: 'name', keyword: '' })
const nutritionData = ref({
  content: [],
  totalElements: 0,
  totalPages: 0
})
const loading = ref(false)

const fetchNutritions = async () => {
  try {
    const response = await nutritionApi.getAllNutritions(page.value, pageSize.value)
    console.log('영양 정보 API 응답:', response)
    nutritionData.value = response
  } catch (error) {
    console.error('영양 정보를 불러오는데 실패했습니다:', error)
  }
}

const fetchSearchResult = async (column, keyword, pageNum) => {
  loading.value = true
  try {
    let response
    if (!keyword) {
      response = await nutritionApi.searchNutritions(null, null, pageNum, pageSize.value)
    } else if (column === 'category') {
      response = await nutritionApi.searchNutritions(null, keyword, pageNum, pageSize.value)
    } else {
      response = await nutritionApi.searchNutritions(keyword, null, pageNum, pageSize.value)
    }
    console.log('검색 결과 API 응답:', response)
    nutritionData.value = response
  } catch (error) {
    nutritionData.value = { content: [], totalElements: 0, totalPages: 0 }
  } finally {
    loading.value = false
  }
}

const onSearch = async ({ column, keyword }) => {
  // 검색 버튼 클릭 시 항상 첫 페이지로 이동
  page.value = 0
  searchState.value = { column, keyword }
  await fetchSearchResult(column, keyword, page.value)
}

const onPageChange = async (newPage) => {
  page.value = newPage
  const { column, keyword } = searchState.value
  // 둘 다 null/빈값이면 전체 검색, 아니면 현재 옵션 유지
  if ((!keyword || keyword === '') && (!column || column === '')) {
    await fetchSearchResult('name', '', page.value)
  } else {
    await fetchSearchResult(column, keyword, page.value)
  }
}

const onSelect = (row) => {
  console.log('NutritionSearchModal - 선택된 음식 데이터:', row)
  console.log('NutritionSearchModal - 현재 amount 값:', props.amount)
  const foodData = { ...row, amount: props.amount }
  console.log('NutritionSearchModal - 전송할 데이터:', foodData)
  
  // store에 데이터 저장
  calendarStore.selectedFood = foodData
  console.log('NutritionSearchModal - store 업데이트 완료')
  
  closeModal()
}

function closeModal() {
  emit('update:show', false)
  calendarStore.closeNutritionModal()
}

// 모달이 처음 열릴 때만 API를 호출
watch(() => props.show, (newValue) => {
  if (newValue) {
    fetchNutritions()
  }
})
</script>

<style scoped>
.nutrition-list-modal {
  padding: 1rem 0.5rem;
}
</style>


