<template>
  <div class="ai-diet-container">
    <div class="ai-diet-header">
      <h1>AI 식단 상담</h1>
      <p>당신의 식단을 분석하고 맞춤형 조언을 받아보세요</p>
    </div>

    <div class="period-selector" v-if="!selectedPeriod">
      <h2>분석할 기간을 선택해주세요</h2>
      <div class="selector-container">
        <div class="month-selector">
          <label for="month">월</label>
          <select id="month" v-model="selectedMonth">
            <option v-for="month in 12" :key="month" :value="month">{{ month }}월</option>
          </select>
        </div>
        <div class="week-selector">
          <label for="week">주차</label>
          <select id="week" v-model="selectedWeek">
            <option v-for="week in getWeeksInMonth(selectedMonth)" :key="week" :value="week">{{ week }}주차</option>
          </select>
        </div>
        <button class="start-button" @click="startAnalysis" :disabled="!selectedMonth || !selectedWeek">
          분석 시작하기
        </button>
      </div>
    </div>

    <div class="chat-container" v-else>
      <div class="chat-header">
        <span class="period-info">{{ selectedMonth }}월 {{ selectedWeek }}주차 식단 분석</span>
        <button class="change-period" @click="resetPeriod">기간 변경</button>
      </div>
      <div class="chat-messages" ref="chatMessages">
        <div v-for="(message, index) in messages" :key="index" 
             :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
          <div class="message-content">
            <div v-if="message.role === 'assistant' && message.isLoading" class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div v-else>{{ message.content }}</div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <input 
          v-model="userInput" 
          @keyup.enter="sendMessage"
          placeholder="식단에 대해 궁금한 점을 물어보세요..."
          :disabled="isLoading"
        />
        <button @click="sendMessage" :disabled="isLoading || !userInput.trim()">
          전송
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import axiosInstance from '@/utils/axios'

const authStore = useAuthStore()
const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const chatMessages = ref(null)
const selectedMonth = ref(null)
const selectedWeek = ref(null)
const selectedPeriod = ref(false)
const sessionId = ref(null)

// 월별 주차 수 계산
const getWeeksInMonth = (month) => {
  const year = new Date().getFullYear()
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const totalDays = lastDay.getDate()
  return Math.ceil((totalDays + firstDay.getDay()) / 7)
}

// 선택한 월이 변경될 때 주차 수 업데이트
const updateWeeks = () => {
  if (selectedMonth.value) {
    const weeks = getWeeksInMonth(selectedMonth.value)
    if (selectedWeek.value > weeks) {
      selectedWeek.value = weeks
    }
  }
}

watch(selectedMonth, updateWeeks)

const scrollToBottom = async () => {
  await nextTick()
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

// 세션 생성
const createSession = async () => {
  try {
    const response = await axiosInstance.post('/api/chat/session', null, {
      params: {
        title: `${selectedMonth.value}월 ${selectedWeek.value}주차 식단 분석`
      }
    })
    sessionId.value = response.data
  } catch (error) {
    console.error('세션 생성 실패:', error)
    messages.value.push({
      role: 'assistant',
      content: '채팅 세션을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.'
    })
  }
}

const startAnalysis = async () => {
  // 선택한 월의 첫 날
  const startDate = new Date(new Date().getFullYear(), selectedMonth.value - 1, 1)
  
  // 선택한 주차의 시작일 계산 (1주차는 1일부터, 2주차는 8일부터 등)
  const weekStartDay = (selectedWeek.value - 1) * 7 + 1
  startDate.setDate(weekStartDay)
  
  // 선택한 주차의 마지막 날 계산
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  
  // 날짜를 YYYY-MM-DD'T'HH:mm:ss.SSS'Z' 형식으로 변환
  const formatDate = (date) => {
    return date.toISOString()
  }
  
  selectedPeriod.value = true
  messages.value = [{
    role: 'assistant',
    content: `안녕하세요! ${selectedMonth.value}월 ${selectedWeek.value}주차 식단을 분석해드리겠습니다. 이번 주 식단에 대해 궁금한 점이 있으시다면 언제든 물어보세요.`
  }]
  
  try {
    // 세션 생성
    await createSession()
    
    const response = await axiosInstance.get('/api/diet/summaries', {
      params: {
        start: formatDate(startDate),
        end: formatDate(endDate)
      }
    })
    
    if (response.data && response.data.length > 0) {
      messages.value.push({
        role: 'assistant',
        content: `${formatDate(startDate)}부터 ${formatDate(endDate)}까지의 식단 데이터를 분석했습니다. 어떤 점이 궁금하신가요?`
      })
    } else {
      messages.value.push({
        role: 'assistant',
        content: '해당 기간의 식단 데이터가 없습니다. 다른 기간을 선택해주세요.'
      })
      resetPeriod()
    }
  } catch (error) {
    console.error('식단 데이터 조회 실패:', error)
    messages.value.push({
      role: 'assistant',
      content: '식단 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.'
    })
    resetPeriod()
  }
}

const resetPeriod = () => {
  selectedPeriod.value = false
  selectedMonth.value = null
  selectedWeek.value = null
  messages.value = []
  sessionId.value = null
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value || !sessionId.value) return

  const userMessage = userInput.value
  userInput.value = ''
  
  messages.value.push({
    role: 'user',
    content: userMessage
  })

  messages.value.push({
    role: 'assistant',
    content: '',
    isLoading: true
  })

  await scrollToBottom()
  isLoading.value = true

  try {
    const response = await axiosInstance.post('/api/chat/message', userMessage, {
      params: {
        sessionId: sessionId.value,
        month: selectedMonth.value,
        week: selectedWeek.value
      }
    })

    messages.value.pop()
    messages.value.push({
      role: 'assistant',
      content: response.data.content
    })
  } catch (error) {
    console.error('메시지 전송 실패:', error)
    messages.value.pop()
    messages.value.push({
      role: 'assistant',
      content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.'
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}
</script>

<style scoped>
.ai-diet-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.ai-diet-header {
  text-align: center;
  margin-bottom: 2rem;
}

.ai-diet-header h1 {
  color: #22a366;
  margin-bottom: 0.5rem;
}

.period-selector {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
}

.period-selector h2 {
  color: #333;
  margin-bottom: 2rem;
}

.selector-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.month-selector,
.week-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.month-selector label,
.week-selector label {
  font-weight: 500;
  color: #666;
}

.month-selector select,
.week-selector select {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 120px;
}

.start-button {
  padding: 0.8rem 2rem;
  background: #22a366;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  margin-top: 1.5rem;
}

.start-button:hover:not(:disabled) {
  background: #1d8c57;
}

.start-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.chat-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-info {
  font-weight: 500;
  color: #333;
}

.change-period {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: background 0.2s;
}

.change-period:hover {
  background: #eee;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.user-message {
  align-items: flex-end;
}

.assistant-message {
  align-items: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.user-message .message-content {
  background: #22a366;
  color: white;
}

.assistant-message .message-content {
  background: #f5f5f5;
  color: #333;
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 0.5rem;
}

.chat-input input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
}

.chat-input button {
  padding: 0.8rem 1.5rem;
  background: #22a366;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.chat-input button:hover:not(:disabled) {
  background: #1d8c57;
}

.chat-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-dots {
  display: flex;
  gap: 0.3rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #666;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style> 