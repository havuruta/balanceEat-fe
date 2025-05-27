<template>
  <div class="score-card">
    <h3 class="title">나의 점수 현황</h3>
    
    <div class="score-section">
      <div class="score-item">
        <span class="label">지난주 점수</span>
        <div class="score">{{ lastWeekScore }}</div>
      </div>
      <div class="score-item current">
        <span class="label">이번주 점수</span>
        <div class="score">{{ currentWeekScore }}</div>
        <div class="score-trend" :class="scoreTrend.class">
          {{ scoreTrend.text }}
        </div>
      </div>
    </div>

    <div class="feedback-section">
      <h4>AI 피드백</h4>
      <p class="feedback-text">{{ feedback }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAxios } from '@/composables/useAxios'

const axios = useAxios()
const lastWeekScore = ref(65)  // 더미 데이터
const currentWeekScore = ref(95)  // 더미 데이터
const feedback = ref('식단 기록이 꾸준히 이어지고 있어요! 특히 단백질 섭취가 잘 되고 있네요. 이번 주는 채소 섭취를 조금 더 늘려보는 건 어떨까요?')  // 더미 데이터

const scoreTrend = computed(() => {
  const diff = currentWeekScore.value - lastWeekScore.value
  if (diff > 0) {
    return {
      text: `+${diff} 상승`,
      class: 'increase'
    }
  } else if (diff < 0) {
    return {
      text: `${diff} 하락`,
      class: 'decrease'
    }
  }
  return {
    text: '변동없음',
    class: 'neutral'
  }
})

const fetchScores = async () => {
  try {
    const response = await axios.get('/user/challenge/scores')
    if (response.status === 200) {
      lastWeekScore.value = response.data.lastWeekScore
      currentWeekScore.value = response.data.currentWeekScore
      feedback.value = response.data.feedback
    }
  } catch (error) {
    console.error('점수 조회 실패:', error)
    // 에러 발생 시에도 더미 데이터는 유지
  }
}

onMounted(() => {
  fetchScores()
})
</script>

<style scoped>
.score-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 300px;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
}

.score-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.score-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.score-item.current {
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
}

.label {
  font-size: 0.9rem;
  color: #666;
  display: block;
  margin-bottom: 0.5rem;
}

.score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.score-trend {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.score-trend.increase {
  color: #2e7d32;
}

.score-trend.decrease {
  color: #c62828;
}

.score-trend.neutral {
  color: #666;
}

.feedback-section {
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.feedback-section h4 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.feedback-text {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
}
</style> 