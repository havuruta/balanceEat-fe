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
      :date="selectedDate"
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
        :is-open="showDetailModal"
        :date="selectedDate"
        @close="showDetailModal = false"
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
    <MealTypeConfirmModal
      :show="showMealTypeModal"
      :suggested-type="suggestedMealType"
      :time="selectedTime"
      @update:show="showMealTypeModal = $event"
      @confirm="handleMealTypeConfirm"
    />
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
import { useCalendarStore } from '@/stores/calendarStore'
import AddDietModal from './AddDietModal.vue'
import NutritionSearchModal from './NutritionSearchModal.vue'
import DietDetailModal from '@/views/Calendar/DietDetailModal.vue'
import NutrientPieChart from './NutrientPieChart.vue'
import MealTypeConfirmModal from './MealTypeConfirmModal.vue'
import axiosInstance from '@/utils/axios'
import { API_ROUTES } from '@/config/api'

const calendarStore = useCalendarStore()
const calendar = ref(null)
const showAddModal = ref(false)
const showNutritionModal = ref(false)
const showDetailModal = ref(false)
const showEditDeleteModal = ref(false)
const selectedNutrition = ref(null)
const detailDiets = ref([])
const addMealType = ref('BREAKFAST')
const showAnalyzeModal = ref(false)
const analyzeSummary = ref({ protein: 0, fat: 0, carbohydrates: 0 })
const selectedDate = ref(null)

const showMealTypeModal = ref(false)
const selectedTime = ref('')
const suggestedMealType = ref('')

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
    dateClick: async (info) => {
      selectedDate.value = info.dateStr
      try {
        // 해당 날짜의 식단 정보 조회
        const response = await axiosInstance.get(`/api/diet/detail?date=${selectedDate.value}`)
        const dietData = response.data
        
        // 식단이 하나도 없는 경우
        if (!dietData.breakfast?.length && 
            !dietData.lunch?.length && 
            !dietData.dinner?.length && 
            !dietData.snack?.length && 
            !dietData.night?.length) {
          // 식단 추가 모달 열기
          addMealType.value = 'BREAKFAST'
          dietForm.value.date = selectedDate.value  // 선택된 날짜로 설정
          showAddModal.value = true
          return
        }
        
        // 식단이 있는 경우 상세 모달 열기
        showDetailModal.value = true
      } catch (error) {
        console.error('식단 정보 조회 중 오류 발생:', error)
        // 에러 발생 시에도 식단 추가 모달 열기
        addMealType.value = 'BREAKFAST'
        dietForm.value.date = selectedDate.value  // 선택된 날짜로 설정
        showAddModal.value = true
      }
    },
    views: {
      dayGridMonth: {
        dayMaxEventRows: 3,
        eventContent: (arg) => {
          const summary = arg.event.extendedProps
          const meals = []
          
          if (summary.breakfastCalories > 0) meals.push('🍳')
          if (summary.lunchCalories > 0) meals.push('🍚')
          if (summary.dinnerCalories > 0) meals.push('🍖')
          if (summary.snackCalories > 0) meals.push('🍪')
          if (summary.nightCalories > 0) meals.push('🌙')
          
          // 식단이 하나도 없는 경우
          if (meals.length === 0) {
            return {
              html: `
                <div class='cell-meal-strip empty-meal'>
                  ❌
                </div>
              `
            }
          }
          
          return {
            html: `
              <div class='cell-meal-strip'>
                ${meals.join(' ')}
              </div>
            `
          }
        }
      },
      timeGridWeek: {
        titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
        slotMinTime: '06:00:00',
        slotMaxTime: '22:00:00',
      },
      timeGridDay: {
        titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
        slotMinTime: '06:00:00',
        slotMaxTime: '22:00:00',
      },
    },
    events: fetchEvents,
    eventClick: handleEventClick,
    height: 'auto',
    contentHeight: 800,
    expandRows: true,
    stickyHeaderDates: true,
    dayMaxEvents: false,
    nowIndicator: true,
    slotDuration: '01:00:00',
    slotLabelInterval: '01:00',
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    eventMaxStack: 3,
    eventMinHeight: 30,
    eventShortHeight: 30,
    eventLongPressDelay: 200,
    eventOverlap: false,
    eventConstraint: {
      startTime: '06:00',
      endTime: '22:00',
    }
  })
  calendar.value.render()
})

// 이벤트 가져오기
async function fetchEvents(info, successCallback, failureCallback) {
  try {
    const startDate = info.startStr.split('T')[0]  // yyyy-MM-dd 형식으로 변환
    const endDate = info.endStr.split('T')[0]      // yyyy-MM-dd 형식으로 변환
    
    const response = await axiosInstance.get(API_ROUTES.DIET.SUMMARIES, {
      params: {
        start: startDate,
        end: endDate
      }
    })
    
    if (!response.data) {
      throw new Error('식단 정보를 가져오는데 실패했습니다.')
    }

    const events = response.data.map((summary) => ({
      title: '식단',
      start: summary.summaryDate,
      end: summary.summaryDate,
      allDay: true,
      extendedProps: summary
    }))

    successCallback(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    failureCallback(error)
  }
}

// 이벤트 클릭 핸들러
const handleEventClick = (info) => {
  selectedDate.value = info.event.startStr.split('T')[0]  // 날짜만 추출
  showDetailModal.value = true
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
  if (calendar.value) {
    calendar.value.refetchEvents()
  }
}

function handleAddMeal(mealType) {
  addMealType.value = mealType
  showAddModal.value = true
}

function getMealTypeByTime(time) {
  const hour = parseInt(time.split(':')[0])
  const minute = parseInt(time.split(':')[1])
  const timeValue = hour + minute / 60

  // 시간대별 매핑
  if (timeValue >= 5 && timeValue < 10) return 'BREAKFAST'
  if (timeValue >= 11 && timeValue < 15) return 'LUNCH'
  if (timeValue >= 17 && timeValue < 21) return 'DINNER'
  if (timeValue >= 10 && timeValue < 17) return 'SNACK'
  if (timeValue >= 21 || timeValue < 5) return 'NIGHT'
  
  return null
}

function handleTimeSelect(time) {
  selectedTime.value = time
  const mealType = getMealTypeByTime(time)
  
  if (mealType === 'SNACK' || mealType === 'NIGHT') {
    suggestedMealType.value = mealType
    showMealTypeModal.value = true
  } else {
    addMealType.value = mealType
    showAddModal.value = true
  }
}

// 식단 추가 모달 열기
function openAddDietModal(time) {
  handleTimeSelect(time)
}

// 식사 유형 선택 모달에서 선택 완료
function handleMealTypeConfirm(mealType) {
  addMealType.value = mealType
  showMealTypeModal.value = false
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
  padding: 2rem;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  min-height: 800px;
}

:deep(.fc) {
  font-family: 'Pretendard', 'Noto Sans KR', Arial, sans-serif;
  background: transparent;
}

:deep(.fc-daygrid-day),
:deep(.fc-daygrid-day-frame) {
  background: transparent !important;
  min-height: 120px !important;
  transition: all 0.2s ease;
}

:deep(.fc-daygrid-day:hover) {
  background: #f8fafc !important;
  transform: scale(1.02);
  z-index: 1;
}

:deep(.fc-daygrid-day-top) {
  margin-bottom: 12px;
  justify-content: center;
}

:deep(.fc-daygrid-day-number) {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a5568;
  padding: 8px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

:deep(.fc-daygrid-day:hover .fc-daygrid-day-number) {
  background: #4a90e2;
  color: white;
}

:deep(.fc-toolbar) {
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

:deep(.fc-toolbar-title) {
  font-size: 1.8rem !important;
  font-weight: 700;
  color: #1a202c;
  letter-spacing: -1px;
}

:deep(.fc-button) {
  background-color: #4a90e2 !important;
  border: none !important;
  color: #fff !important;
  font-weight: 600;
  padding: 0.8rem 1.5rem;
  border-radius: 12px !important;
  margin: 0 0.3rem;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
  transition: all 0.3s ease;
}

:deep(.fc-button:hover),
:deep(.fc-button:focus) {
  background-color: #357abd !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 144, 226, 0.2);
}

:deep(.fc-button-active),
:deep(.fc-button-primary:not(:disabled):active) {
  background-color: #357abd !important;
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.2);
}

:deep(.fc-today-button) {
  background: #ffb300 !important;
  color: #fff !important;
  font-weight: 700;
}

:deep(.fc-daygrid-day.fc-day-today) {
  background: #e3f2fd !important;
  border-radius: 16px;
  box-shadow: 0 0 0 2px #4a90e2 inset;
}

:deep(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
  background: #4a90e2;
  color: white;
}

.cell-meal-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
}

.cell-meal-strip.empty-meal {
  background: #f8f9fa;
  color: #dc3545;
  font-size: 1.4rem;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.cell-meal-strip:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
}

.cell-meal-strip.empty-meal:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

/* 반응형 */
@media (max-width: 900px) {
  #calendar {
    padding: 1rem;
    min-height: 600px;
  }
  
  :deep(.fc-toolbar-title) {
    font-size: 1.4rem !important;
  }
  
  :deep(.fc-daygrid-day-frame) {
    min-height: 80px !important;
  }
  
  :deep(.fc-button) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 600px) {
  .calendar-view {
    padding: 0;
  }
  
  #calendar {
    border-radius: 16px;
    min-height: 400px;
  }
  
  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  :deep(.fc-daygrid-day-frame) {
    min-height: 60px !important;
  }
  
  :deep(.fc-daygrid-day-number) {
    font-size: 0.9rem;
    width: 28px;
    height: 28px;
  }
  
  .cell-meal-strip {
    font-size: 1.1rem;
    padding: 4px 0 2px 0;
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
</style>
