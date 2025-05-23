<template>
  <div class="calendar-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>식단 달력</h2>
      <BaseButton
        color="primary"
        @click="
          () => {
            addMealType = 'BREAKFAST'
            showAddModal = true
          }
        "
        >식단 추가하기</BaseButton
      >
    </div>
    <div id="calendar"></div>
    <AddDietModal
      :show="showAddModal"
      :selectedNutrition="calendarStore.selectedNutrition"
      :mealType="addMealType"
      @update:show="showAddModal = $event"
      @refresh="refetchEvents"
    />
    <NutritionSearchModal
      :show="calendarStore.showNutritionModal"
      @update:show="calendarStore.showNutritionModal = $event"
    />
    <transition name="fade-modal" mode="out-in">
      <DietDetailModal
        v-if="showDetailModal"
        :show="showDetailModal"
        :diets="detailDiets"
        :date="detailDate"
        @update:show="showDetailModal = $event"
        @update="handleUpdateDiet"
        @delete="handleDeleteDiet"
        @add="handleAddMeal"
      />
    </transition>
    <BaseModal
      :model-value="showAnalyzeModal"
      @close="showAnalyzeModal = false"
      :style="{ zIndex: 5000 }"
    >
      <template #default>
        <NutrientPieChart :summary="analyzeSummary" />
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import BaseModal from '@/components/base/Modal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseSearchTable from '@/components/base/BaseSearchTable.vue'
import { useCalendarStore } from '@/stores/calendarStore'
import AddDietModal from './AddDietModal.vue'
import NutritionSearchModal from './NutritionSearchModal.vue'
import DietDetailModal from './DietDetailModal.vue'
import NutrientPieChart from './NutrientPieChart.vue'

const calendarStore = useCalendarStore()
const calendar = ref(null)
const showAddModal = ref(false)
const showNutritionModal = ref(false)
const showDetailModal = ref(false)
const showEditDeleteModal = ref(false)
const nutritionSearch = ref('')
const nutritionResults = ref([])
const selectedNutrition = ref(null)
const selectedDiet = ref({})
const detailDiets = ref([])
const detailDate = ref('')
const addMealType = ref('BREAKFAST')
const showAnalyzeModal = ref(false)
const analyzeSummary = ref({ protein: 0, fat: 0, carbohydrates: 0 })

// fake summary db (날짜별)
const fakeSummaryMap = {}
for (let d = 1; d <= 15; d++) {
  const date = `2025-05-${d.toString().padStart(2, '0')}`
  fakeSummaryMap[date] = {
    protein: Math.floor(Math.random() * 30) + 10,
    fat: Math.floor(Math.random() * 20) + 5,
    carbohydrates: Math.floor(Math.random() * 60) + 20,
  }
}

// 식단 추가 폼
const dietForm = ref({
  date: new Date().toISOString().split('T')[0],
  mealType: 'BREAKFAST',
  foodSearch: '',
  amount: '',
  note: '',
})

// 수정/삭제 관련 상태
const editDiets = ref([])

const mealTypeOptions = [
  { value: 'BREAKFAST', label: '아침' },
  { value: 'LUNCH', label: '점심' },
  { value: 'DINNER', label: '저녁' },
]

// 영양정보 표 컬럼 및 옵션 (NutritionListView 참고)
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
const nutritionAllRows = ref([]) // 실제 API 연동 시 fetch로 대체
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
    selectedNutrition.value = {
      id: food.id,
      name: food.name,
      calories: food.calorie,
      protein: food.protein,
      fat: food.fat,
      carbohydrates: food.carb,
      category: food.category,
    }
    dietForm.value.foodSearch = food.name
    showNutritionModal.value = false
  }
}
function handleNutritionPageChange(newPage) {
  nutritionPage.value = newPage
}

const calculatedNutrition = computed(() => {
  if (!selectedNutrition.value || !dietForm.value.amount)
    return {
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
    }
  const ratio = Number(dietForm.value.amount) / 100
  return {
    calories: (selectedNutrition.value.calories * ratio).toFixed(1),
    protein: (selectedNutrition.value.protein * ratio).toFixed(1),
    fat: (selectedNutrition.value.fat * ratio).toFixed(1),
    carbohydrates: (selectedNutrition.value.carbohydrates * ratio).toFixed(1),
  }
})

function getRandomMealIcons() {
  return {
    breakfast: Math.random() > 0.4 ? '🍳' : '❌',
    lunch: Math.random() > 0.4 ? '🍚' : '❌',
    dinner: Math.random() > 0.4 ? '🍖' : '❌',
  }
}

function generateFakeEvents() {
  const events = []
  for (let d = 1; d <= 15; d++) {
    const date = `2025-05-${d.toString().padStart(2, '0')}`
    const icons = getRandomMealIcons()
    events.push({
      title: icons.breakfast + icons.lunch + icons.dinner,
      start: date,
      allDay: true,
      extendedProps: {
        summaryDate: date,
        breakfastCalories: icons.breakfast === '🍳' ? 300 : 0,
        lunchCalories: icons.lunch === '🍚' ? 500 : 0,
        dinnerCalories: icons.dinner === '🍖' ? 700 : 0,
      },
    })
  }
  return events
}

function eventContent(arg) {
  const icons = arg.event.title
  const date = arg.event.startStr
  return {
    html: `
      <div class='cell-meal-strip'>${icons}</div>
      <div class='cell-analyze-strip' data-date='${date}' style="color:#222;">분석</div>
    `,
  }
}

// 캘린더 초기화
onMounted(() => {
  const calendarEl = document.getElementById('calendar')
  calendar.value = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    views: {
      timeGridWeek: {
        titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      },
      timeGridDay: {
        titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      },
    },
    events: generateFakeEvents(),
    eventContent,
    eventClick: handleEventClick,
    eventDidMount: function (info) {
      const analyzeEl = info.el.querySelector('.cell-analyze-strip')
      if (analyzeEl) {
        analyzeEl.addEventListener('click', (e) => {
          e.stopPropagation()
          const date = analyzeEl.getAttribute('data-date')
          if (fakeSummaryMap[date]) {
            analyzeSummary.value = fakeSummaryMap[date]
            showAnalyzeModal.value = true
          }
        })
      }
    },
    height: 'auto',
    contentHeight: 800,
    expandRows: true,
    stickyHeaderDates: true,
    dayMaxEvents: true,
    nowIndicator: true,
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: true,
    slotDuration: '01:00:00',
    slotLabelInterval: '01:00',
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  })
  calendar.value.render()

  // 기존 NutritionListView의 allRows를 그대로 사용 (실제 서비스에서는 API로 대체)
  nutritionAllRows.value = [
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
    {
      id: 4,
      name: '기장밥',
      calorie: 166,
      protein: 3.44,
      fat: 0.57,
      carb: 36.77,
      category: '밥류',
    },
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
    {
      id: 10,
      name: '김밥_참치',
      calorie: 174,
      protein: 7,
      fat: 7.22,
      carb: 20.26,
      category: '밥류',
    },
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
  ]
})

// 이벤트 가져오기
async function fetchEvents(info, successCallback, failureCallback) {
  try {
    const response = await fetch(`/diet/summaries?start=${info.startStr}&end=${info.endStr}`)
    const data = await response.json()

    const events = data.map((summary) => ({
      title:
        (summary.breakfastCalories > 0 ? '🍳' : '❌') +
        (summary.lunchCalories > 0 ? '🍚' : '❌') +
        (summary.dinnerCalories > 0 ? '🍖' : '❌'),
      start: summary.summaryDate,
      allDay: true,
      extendedProps: summary,
    }))

    successCallback(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    failureCallback(error)
  }
}

// 이벤트 클릭 핸들러
function handleEventClick(info) {
  // fake: 날짜별로 랜덤 식단 2~3개 생성
  const date = info.event.startStr
  detailDate.value = date
  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER']
  const diets = []
  mealTypes.forEach((meal) => {
    if (Math.random() > 0.3) {
      diets.push({
        id: Math.floor(Math.random() * 10000),
        foodName: meal === 'BREAKFAST' ? '국밥_돼지머리' : meal === 'LUNCH' ? '흰쌀밥' : '현미밥',
        amount: Math.floor(Math.random() * 200) + 50,
        mealType: meal,
      })
    }
  })
  detailDiets.value = diets
  nextTick(() => {
    showDetailModal.value = true
  })
}

function handleUpdateDiet(editedDiet) {
  // 애니메이션 효과를 위해 잠깐 사라졌다가 다시 보이게
  detailDiets.value = detailDiets.value.map((d) =>
    d.id === editedDiet.id ? { ...d, amount: editedDiet.amount } : d,
  )
}
function handleDeleteDiet(diet) {
  detailDiets.value = detailDiets.value.filter((d) => d.id !== diet.id)
}

// 식단 추가
async function submitDiet() {
  if (!selectedNutrition.value) {
    alert('음식을 선택해주세요.')
    return
  }

  if (!dietForm.value.amount || dietForm.value.amount <= 0) {
    alert('올바른 양을 입력해주세요.')
    return
  }

  const ratio = dietForm.value.amount / 100
  const calculatedNutrition = {
    calories: selectedNutrition.value.calories * ratio,
    protein: selectedNutrition.value.protein * ratio,
    fat: selectedNutrition.value.fat * ratio,
    carbohydrates: selectedNutrition.value.carbohydrates * ratio,
  }

  const formData = {
    dietDate: dietForm.value.date,
    mealType: dietForm.value.mealType,
    foodName: selectedNutrition.value.name,
    amount: dietForm.value.amount,
    note: dietForm.value.note,
    ...calculatedNutrition,
  }

  try {
    const response = await fetch('/diet/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (response.status === 401) {
      alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.')
      window.location.href = '/auth/login'
      return
    }

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const result = await response.text()
    alert(result)

    showAddModal.value = false
    calendar.value.refetchEvents()
  } catch (error) {
    console.error('Error submitting diet:', error)
    alert(error.message || '식단 추가 중 오류가 발생했습니다.')
  }
}

// 식사 구분 레이블
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

// 수정/삭제 모달 열기
async function openEditDeleteModal(date) {
  try {
    const response = await fetch(`/diet/edit?date=${date}`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    editDiets.value = Array.isArray(data) ? data : []

    showEditDeleteModal.value = true
  } catch (error) {
    console.error('Error opening edit modal:', error)
    alert('식단 정보를 불러오는 중 오류가 발생했습니다.')
  }
}

// 식단 수정
async function updateDiet(dietId) {
  const diet = editDiets.value.find((d) => d.id === dietId)
  if (!diet) return

  const amount = document.getElementById(`amount_${dietId}`).value
  if (!amount || isNaN(amount) || amount <= 0) {
    alert('올바른 양을 입력해주세요.')
    return
  }

  try {
    const response = await fetch(`/diet/update/${dietId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: parseFloat(amount) }),
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const result = await response.text()
    alert(result)

    // 캘린더 새로고침
    calendar.value.refetchEvents()

    // 수정/삭제 모달 새로고침
    const currentDate = document
      .querySelector('#editDeleteModal .modal-title')
      .textContent.split(' ')[0]
    openEditDeleteModal(currentDate)
  } catch (error) {
    console.error('Error updating diet:', error)
    alert(error.message || '식단 수정 중 오류가 발생했습니다.')
  }
}

// 식단 삭제
async function deleteDiet(dietId) {
  if (!confirm('정말로 이 식단을 삭제하시겠습니까?')) {
    return
  }

  try {
    const response = await fetch(`/diet/delete/${dietId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const result = await response.text()
    alert(result)

    // 캘린더 새로고침
    calendar.value.refetchEvents()

    // 수정/삭제 모달 새로고침
    const currentDate = document
      .querySelector('#editDeleteModal .modal-title')
      .textContent.split(' ')[0]
    openEditDeleteModal(currentDate)
  } catch (error) {
    console.error('Error deleting diet:', error)
    alert(error.message || '식단 삭제 중 오류가 발생했습니다.')
  }
}

// 영양 정보 검색 버튼
function openNutritionModal() {
  showNutritionModal.value = true
}

function refetchEvents() {
  // 캘린더 이벤트 새로고침 로직
}

function handleAddMeal(mealType) {
  addMealType.value = mealType
  showAddModal.value = true
}
</script>

<style scoped>
.calendar-view {
  max-width: 1200px;
  margin: 2.5rem auto 0 auto;
  padding: 0 1rem;
}

h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #2d3a4b;
  letter-spacing: -1px;
}

#calendar {
  margin-top: 2rem;
  background: #fff !important;
  padding: 1.5rem 1rem 2rem 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  min-height: 800px;
}

:deep(.fc) {
  font-family: 'Pretendard', 'Noto Sans KR', Arial, sans-serif;
  background: transparent;
}

:deep(.fc-daygrid-day),
:deep(.fc-daygrid-day-frame) {
  background: transparent !important;
}

:deep(.fc-daygrid-day-top) {
  margin-bottom: 8px;
}

:deep(.fc-daygrid-day-number) {
  font-size: 1.1rem;
  font-weight: 600;
}

:deep(.fc-timegrid-slot) {
  height: 4.5em !important;
}

:deep(.fc-timegrid-col) {
  min-height: 120px !important;
}

:deep(.fc-timegrid-slot-label) {
  font-size: 0.95rem;
  color: #888;
}

:deep(.fc-toolbar) {
  margin-bottom: 1.5rem;
  gap: 1rem;
}

:deep(.fc-toolbar-title) {
  font-size: 1.7rem !important;
  font-weight: 700;
  color: #222;
  letter-spacing: -1px;
}

:deep(.fc-button) {
  background-color: #4a90e2 !important;
  border: none !important;
  color: #fff !important;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border-radius: 8px !important;
  margin: 0 0.2rem;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.08);
  transition: background 0.2s;
}

:deep(.fc-button:hover),
:deep(.fc-button:focus) {
  background-color: #357abd !important;
  color: #fff !important;
}

:deep(.fc-button-active),
:deep(.fc-button-primary:not(:disabled):active) {
  background-color: #357abd !important;
  color: #fff !important;
}

:deep(.fc-today-button) {
  background: #ffb300 !important;
  color: #fff !important;
  font-weight: 700;
}

:deep(.fc-daygrid-day.fc-day-today),
:deep(.fc-timegrid-col.fc-day-today) {
  background: #e3f2fd !important;
  border-radius: 8px;
  box-shadow: 0 0 0 2px #4a90e2 inset;
}

:deep(.fc-daygrid-day:hover),
:deep(.fc-timegrid-col:hover) {
  background: #f0f7ff !important;
  transition: background 0.2s;
}

:deep(.fc-event) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
}

:deep(.fc-daygrid-event-harness),
:deep(.fc-event) {
  overflow: visible !important;
}
:deep(.calendar-event-icons) {
  margin-bottom: 4px;
}

:deep(.meal-icons) {
  font-size: 1.3rem;
  letter-spacing: 2px;
  background: none;
  color: inherit;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
}

/* 반응형 */
@media (max-width: 900px) {
  #calendar {
    padding: 0.5rem 0.2rem 1rem 0.2rem;
    min-height: 500px;
  }
  :deep(.fc-toolbar-title) {
    font-size: 1.1rem !important;
  }
  :deep(.fc-daygrid-day-frame) {
    min-height: 60px !important;
  }
}
@media (max-width: 600px) {
  .calendar-view {
    padding: 0;
  }
  #calendar {
    border-radius: 8px;
    min-height: 250px;
  }
  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 0.5rem;
  }
  :deep(.fc-daygrid-day-frame) {
    min-height: 36px !important;
  }
}

/* 식단 추가 모달 스타일 */
.diet-form {
  padding: 1rem;
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
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-control:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  outline: none;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

.search-group {
  display: flex;
  gap: 0.5rem;
}

.btn-search {
  padding: 0.75rem 1.5rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-search:hover {
  background-color: #357abd;
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
  margin-top: 2rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #cbd5e0;
}

.btn-submit {
  padding: 0.75rem 1.5rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover {
  background-color: #357abd;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  .search-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  .form-actions {
    flex-direction: column;
  }
  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.cell-meal-strip {
  background: #e3f2fd;
  border-radius: 10px;
  padding: 4px 0 2px 0;
  margin-bottom: 6px;
  font-size: 1.2rem;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 48px;
}
.cell-analyze-strip {
  width: 100%;
  min-height: 24px;
  margin-top: 4px;
  background: #fffbe7;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  z-index: 2;
  overflow: visible;
  color: #222;
}
</style>
