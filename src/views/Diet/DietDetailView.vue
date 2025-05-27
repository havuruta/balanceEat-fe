<template>
  <div class="diet-detail">
    <h1>식단 상세</h1>
    <div v-if="dietScore" class="score-section">
      <h2>오늘의 식단 점수</h2>
      <div class="score">{{ dietScore.score }}점</div>
      <div class="feedback">{{ dietScore.feedback }}</div>
    </div>
    <div v-else class="no-data">
      아직 식단 분석 결과가 없습니다.
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

export default {
  name: 'DietDetailView',
  setup() {
    const route = useRoute()
    const dietScore = ref(null)

    const fetchDietScore = async () => {
      try {
        const userId = localStorage.getItem('userId') // 실제 구현시에는 적절한 사용자 인증 방식 사용
        const today = new Date().toISOString().split('T')[0]
        const response = await axios.get(`/api/diet-score/${userId}?date=${today}`)
        dietScore.value = response.data
      } catch (error) {
        console.error('식단 점수를 불러오는데 실패했습니다:', error)
      }
    }

    onMounted(() => {
      fetchDietScore()
    })

    return {
      dietScore
    }
  }
}
</script>

<style scoped>
.diet-detail {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.score-section {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.score {
  font-size: 48px;
  font-weight: bold;
  color: #4CAF50;
  text-align: center;
  margin: 20px 0;
}

.feedback {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style> 