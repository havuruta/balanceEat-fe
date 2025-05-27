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
          <div class="analysis-section">
            <h2>식단 분석 결과</h2>
            <div class="analysis-content">
              <button 
                class="analyze-btn" 
                @click="analyzeDiet" 
                :disabled="isAnalyzing || analysisResult"
                :class="{ analyzing: isAnalyzing, analyzed: analysisResult }"
              >
                {{ isAnalyzing ? '분석 중...' : analysisResult ? '분석 완료' : '식단 분석하기' }}
              </button>
              <div v-if="analysisResult" class="analysis-result">
                <div class="score-section">
                  <h3>점수</h3>
                  <div class="score">{{ analysisResult.score }}점</div>
                </div>
                <div class="feedback-section">
                  <h3>피드백</h3>
                  <p>{{ analysisResult.feedback }}</p>
                </div>
                <button 
                  class="detail-report-btn" 
                  @click="showDetailReport = true"
                >
                  자세한 분석 리포트 보기
                </button>
              </div>
              <div v-else-if="!isAnalyzing" class="no-analysis">
                아직 분석된 결과가 없습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 상세 분석 리포트 모달 -->
  <div v-if="showDetailReport" class="modal-overlay" @click="showDetailReport = false">
    <div class="modal-content report-modal" @click.stop>
      <div class="modal-header">
        <h2>상세 분석 리포트</h2>
        <button class="close-button" @click="showDetailReport = false">&times;</button>
      </div>
      <div class="modal-body">
        <div class="report-section">
          <div class="calorie-analysis-section">
            <h3>칼로리 분석</h3>
            <p>{{ analysisResult.calorieAnalysis }}</p>
          </div>
          <div class="nutrient-analysis-section">
            <h3>영양소 분석</h3>
            <p>{{ analysisResult.nutrientAnalysis }}</p>
          </div>
          <div class="suggestions-section">
            <h3>개선 제안</h3>
            <div class="suggestion-item">
              <span class="suggestion-number">1</span>
              <p>{{ analysisResult.suggestions1 }}</p>
            </div>
            <div class="suggestion-item">
              <span class="suggestion-number">2</span>
              <p>{{ analysisResult.suggestions2 }}</p>
            </div>
            <div class="suggestion-item">
              <span class="suggestion-number">3</span>
              <p>{{ analysisResult.suggestions3 }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 삭제 확인 모달 -->
  <BaseModal :model-value="showDeleteConfirm" @close="showDeleteConfirm = false" :style="{ zIndex: 99999 }">
    <div class="modal-body">
      <p>정말로 이 음식을 삭제하시겠습니까?</p>
      <div class="modal-actions">
        <BaseButton color="secondary" @click="showDeleteConfirm = false">취소</BaseButton>
        <BaseButton color="danger" @click="confirmDelete">삭제</BaseButton>
      </div>
    </div>
  </BaseModal>

  <!-- 수정 확인 모달 -->
  <BaseModal :model-value="showEditConfirm" @close="showEditConfirm = false" :style="{ zIndex: 99999 }">
    <div class="modal-body">
      <p>섭취량을 {{ editingAmount }}g로 수정하시겠습니까?</p>
      <div class="modal-actions">
        <BaseButton color="secondary" @click="showEditConfirm = false">취소</BaseButton>
        <BaseButton color="primary" @click="confirmEdit">수정</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, toRefs, watch, watchEffect } from 'vue'
import axiosInstance from '@/utils/axios'
import NutrientPieChart from '@/views/Calendar/NutrientPieChart.vue'
import BaseModal from '@/components/base/Modal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  isOpen: Boolean,
  date: String
})
const { isOpen, date } = toRefs(props)
const emit = defineEmits(['close', 'refresh'])

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
  emit('refresh')
}

const fetchDietData = async () => {
  if (!date.value) {
    console.log('[fetchDietData] date.value가 없습니다:', date.value)
    return
  }
  console.log('[fetchDietData] API 요청 시작:', date.value)
  try {
    const [detailResponse, summariesResponse] = await Promise.all([
      axiosInstance.get(`/api/diets/detail?date=${date.value}`),
      axiosInstance.get(`/api/diets/summaries?start=${date.value}&end=${date.value}`)
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

const showDeleteConfirm = ref(false)
const showEditConfirm = ref(false)
const dietToDelete = ref(null)
const dietToEdit = ref(null)

function startEdit(diet) {
  editingId.value = diet.id
  editingAmount.value = diet.amount
  dietToEdit.value = diet
}

function saveEdit(diet) {
  showEditConfirm.value = true
}

function confirmEdit() {
  if (dietToEdit.value && editingAmount.value) {
    const diet = dietToEdit.value
    const amount = parseInt(editingAmount.value)
    if (amount > 0) {
      updateDiet(diet.id, amount)
    }
    showEditConfirm.value = false
    editingId.value = null
    editingAmount.value = ''
    dietToEdit.value = null
  }
}

async function updateDiet(dietId, amount) {
  try {
    await axiosInstance.put(`/api/diets/${dietId}`, {
      amount: amount
    })
    await fetchDietData() // 데이터 새로고침
    emit('refresh') // 부모 컴포넌트에 변경사항 알림
  } catch (error) {
    console.error('Error updating diet:', error)
    alert('식단 수정 중 오류가 발생했습니다.')
  }
}

function cancelEdit() {
  editingId.value = null
  editingAmount.value = ''
  dietToEdit.value = null
}

function deleteDiet(diet) {
  dietToDelete.value = diet
  showDeleteConfirm.value = true
}

function confirmDelete() {
  if (dietToDelete.value) {
    const dietId = dietToDelete.value.id
    axiosInstance.delete(`/api/diets/${dietId}`)
      .then(() => {
        fetchDietData() // 데이터 새로고침
        emit('refresh') // 부모 컴포넌트에 변경사항 알림
      })
      .catch(error => {
        console.error('Error deleting diet:', error)
        alert('식단 삭제 중 오류가 발생했습니다.')
      })
    showDeleteConfirm.value = false
    dietToDelete.value = null
  }
}

const isAnalyzing = ref(false)
const analysisResult = ref(null)
const showDetailReport = ref(false)

const checkAnalysisResult = async () => {
  try {
    const response = await axiosInstance.get(`/api/diet-score?date=${date.value}`);
    if (response.data) {
      analysisResult.value = response.data;
    }
  } catch (error) {
    console.error('식단 분석 결과 조회 중 오류 발생:', error);
  }
};

const analyzeDiet = async () => {
  if (isAnalyzing.value) return;
  
  try {
    isAnalyzing.value = true;
    const response = await axiosInstance.get(`/api/chat?date=${date.value}`);
    analysisResult.value = response.data;
    // 분석 완료 후 데이터 새로고침
    await Promise.all([
      fetchDietData(),
      checkAnalysisResult()
    ]);
  } catch (error) {
    console.error('식단 분석 중 오류 발생:', error);
    if (error.response?.status === 429) {
      alert('잠시 후 다시 시도해주세요. (요청 제한 초과)');
    } else {
      alert('식단 분석 중 오류가 발생했습니다.');
    }
  } finally {
    isAnalyzing.value = false;
  }
};

watchEffect(() => {
  console.log('[watchEffect] 상태 변경:', { isOpen: isOpen.value, date: date.value })
  if (isOpen.value && date.value) {
    fetchDietData()
    checkAnalysisResult()
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
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
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
  font-size: 2rem;
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
  min-width: 600px;
}

.summary-section h2 {
  font-size: 1.2rem;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

.summary-item {
  text-align: center;
  padding: 0.2rem;
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
  font-size: 0.8rem;
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

.analysis-section {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.analysis-section h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
}

.analyze-btn {
  width: 100%;
  padding: 0.8rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.analyze-btn:hover:not(:disabled) {
  background-color: #357abd;
}

.analyze-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.analyze-btn.analyzing {
  background-color: #ff9800;
}

.analyze-btn.analyzed {
  background-color: #2196F3;
}

.analysis-result {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.score-section {
  margin-bottom: 1rem;
}

.score-section h3,
.feedback-section h3 {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.score {
  font-size: 2rem;
  font-weight: bold;
  color: #4a90e2;
}

.feedback-section p {
  color: #333;
  line-height: 1.5;
  white-space: pre-line;
}

.no-analysis {
  text-align: center;
  color: #999;
  padding: 1rem;
  font-style: italic;
}

.detail-report-btn {
  width: 100%;
  padding: 0.8rem;
  margin-top: 1rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.detail-report-btn:hover {
  background-color: #357abd;
}

.report-modal {
  max-width: 800px;
  max-height: 80vh;
}

.report-section {
  padding: 1rem;
}

.report-section h3 {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #4a90e2;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.suggestion-number {
  background: #4a90e2;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.suggestion-item p {
  margin: 0;
  line-height: 1.5;
  color: #333;
}

.calorie-analysis-section,
.nutrient-analysis-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.calorie-analysis-section p,
.nutrient-analysis-section p {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style> 