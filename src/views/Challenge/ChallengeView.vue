<template>
  <div class="challenge-container">
    <div class="challenge-content">
      <div class="ranking-section">
        <h2>챌린지 랭킹</h2>
        <!-- 상위 10위 랭킹 -->
        <div class="ranking-list">
          <div v-for="(user, index) in rankings" 
               :key="user.id" 
               class="ranking-item"
               :class="{ 'my-rank': user.id === currentUserId }">
            <div class="rank" :class="{
              'gold': index === 0,
              'silver': index === 1,
              'bronze': index === 2
            }">{{ index + 1 }}</div>
            <div class="user-info" @click="showUserProfile(user.id)">
              <img :src="user.profileImageUrl || '/default-profile.png'" alt="프로필 이미지" class="profile-image">
              <span class="nickname">{{ user.nickname }}</span>
            </div>
            <div class="score">{{ user.score }}점</div>
          </div>
        </div>
      </div>
      
      <div class="score-section">
        <ChallengeScoreCard />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAxios } from '@/composables/useAxios'
import ChallengeScoreCard from '@/views/Challenge/ChallengeScore.vue'

const axios = useAxios()
const rankings = ref([
  { id: 1, nickname: "건강왕", profileImageUrl: null, score: 95 },
  { id: 2, nickname: "다이어터", profileImageUrl: null, score: 92 },
  { id: 3, nickname: "채소마스터", profileImageUrl: null, score: 88 },
  { id: 4, nickname: "단백질러버", profileImageUrl: null, score: 85 },
  { id: 5, nickname: "식단관리중", profileImageUrl: null, score: 82 },
  { id: 6, nickname: "건강한하루", profileImageUrl: null, score: 80 },
  { id: 7, nickname: "밸런스지키기", profileImageUrl: null, score: 78 },
  { id: 8, nickname: "영양가득", profileImageUrl: null, score: 75 },
  { id: 9, nickname: "식단기록왕", profileImageUrl: null, score: 73 },
  { id: 10, nickname: "건강챌린저", profileImageUrl: null, score: 70 }
])
const currentUserId = ref(1) // 임시로 1번 유저를 현재 사용자로 설정

const fetchRankings = async () => {
  try {
    const response = await axios.get('/challenge/rankings')
    if (response.status === 200) {
      rankings.value = response.data.rankings
      currentUserId.value = response.data.currentUserId
    }
  } catch (error) {
    console.error('랭킹 조회 실패:', error)
    // 에러 발생 시에도 더미 데이터는 유지
  }
}

const showUserProfile = (userId) => {
  // TODO: 사용자 프로필 모달 표시 로직 구현
  console.log('사용자 프로필 보기:', userId)
}

onMounted(() => {
  fetchRankings()
})
</script>

<style scoped>
.challenge-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.challenge-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.ranking-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ranking-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.ranking-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.ranking-item:hover {
  background-color: #f8f9fa;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank {
  width: 50px;
  font-weight: bold;
  color: #666;
  font-size: 1.2rem;
}

/* 메달 색상 */
.rank.gold {
  color: #ffd700;
  font-size: 1.4rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.rank.silver {
  color: #c0c0c0;
  font-size: 1.4rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.rank.bronze {
  color: #cd7f32;
  font-size: 1.4rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f0f0f0;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #e9ecef;
}

.nickname {
  font-weight: 500;
  font-size: 1.1rem;
  color: #333;
}

.score {
  font-weight: bold;
  color: #22a366;
  font-size: 1.2rem;
  min-width: 80px;
  text-align: right;
}

/* 내 랭킹 스타일 */
.my-rank {
  background: #e6f4ea !important;
}

.my-rank:hover {
  background: #d7eee0 !important;
}

.score-section {
  position: sticky;
  top: 2rem;
}

@media (max-width: 768px) {
  .challenge-content {
    grid-template-columns: 1fr;
  }
  
  .score-section {
    position: static;
  }
}
</style> 