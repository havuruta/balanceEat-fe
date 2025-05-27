<template>
  <div class="profile-page">
    <div v-if="userProfile" class="profile-container">
      <div class="profile-header">
        <div class="profile-info-section">
          <div class="profile-row">
            <div class="nickname-challenge-container">
              <div v-if="isEditing">
                <input 
                  v-model="editForm.nickname" 
                  class="edit-input"
                  placeholder="닉네임을 입력하세요"
                />
              </div>
              <h2 v-else>{{ userProfile.nickname }}</h2>
              <div class="challenge-participation">
                <span>챌린지 참여</span>
                <label class="switch">
                  <input 
                    type="checkbox" 
                    v-model="userProfile.isChallengeEnabled"
                    @change="handleChallengeToggle"
                  >
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="profile-row">
            <div v-if="isEditing">
              <input 
                v-model="editForm.goalMessage" 
                class="edit-input"
                placeholder="목표를 입력하세요"
              />
            </div>
            <p v-else class="goal">{{ userProfile.goalMessage || '목표를 설정해주세요' }}</p>
          </div>

          <div class="button-group">
            <button 
              v-if="!isEditing" 
              @click="startEditing" 
              class="edit-profile-link"
            >
              프로필 수정
            </button>
            <button 
              v-if="isEditing" 
              @click="handleSave" 
              class="edit-profile-link"
            >
              저장
            </button>
            <button 
              v-if="isEditing" 
              @click="cancelEditing" 
              class="edit-profile-link cancel"
            >
              취소
            </button>
            <button 
              v-if="!isEditing"
              @click="handlePasswordModalOpen" 
              class="edit-profile-link"
            >
              비밀번호 변경
            </button>
            <button 
              v-if="!isEditing"
              @click="showDeleteConfirm" 
              class="edit-profile-link delete"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>

      <div class="profile-body">
        <div class="profile-grid">
          <div class="info-group">
            <label>성별</label>
            <div v-if="isEditing">
              <select v-model="editForm.gender" class="edit-input">
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
                <option value="OTHER">기타</option>
              </select>
            </div>
            <span v-else>{{ getGenderLabel(userProfile.gender) }}</span>
          </div>

          <div class="info-group">
            <label>나이</label>
            <div v-if="isEditing">
              <input 
                v-model="editForm.birthYear" 
                type="number" 
                class="edit-input"
                placeholder="출생연도"
              />
            </div>
            <span v-else>{{ calculateAge(userProfile.birthYear) }}세</span>
          </div>

          <div class="info-group">
            <label>키</label>
            <div v-if="isEditing">
              <input 
                v-model="editForm.height" 
                type="number" 
                class="edit-input"
                placeholder="키(cm)"
              />
            </div>
            <span v-else>{{ userProfile.height }}cm</span>
          </div>

          <div class="info-group">
            <label>몸무게</label>
            <div v-if="isEditing">
              <input 
                v-model="editForm.weight" 
                type="number" 
                class="edit-input"
                placeholder="몸무게(kg)"
              />
            </div>
            <span v-else>{{ userProfile.weight }}kg</span>
          </div>

          <div class="info-group full-width">
            <label>질병</label>
            <div v-if="isEditing">
              <input 
                v-model="editForm.diseaseCode" 
                class="edit-input"
                placeholder="질병 정보를 입력하세요"
              />
            </div>
            <span v-else>{{ userProfile.diseaseCode || '없음' }}</span>
          </div>

          <div class="info-group full-width">
            <label>식습관</label>
            <div v-if="isEditing">
              <input 
                v-model="editForm.dietHabit" 
                class="edit-input"
                placeholder="식습관을 입력하세요"
              />
            </div>
            <span v-else>{{ userProfile.dietHabit || '미입력' }}</span>
          </div>

          <div class="info-group full-width">
            <label>선호 음식</label>
            <div v-if="isEditing">
              <input 
                v-model="editForm.foodPreference" 
                class="edit-input"
                placeholder="선호하는 음식을 입력하세요"
              />
            </div>
            <span v-else>{{ userProfile.foodPreference || '미입력' }}</span>
          </div>

          <div class="info-group full-width">
            <label>비선호 음식</label>
            <div v-if="isEditing">
              <input 
                v-model="editForm.foodBlacklist" 
                class="edit-input"
                placeholder="비선호 음식을 입력하세요"
              />
            </div>
            <span v-else>{{ userProfile.foodBlacklist || '미입력' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="loading">
      프로필을 불러오는 중...
    </div>

    <!-- 비밀번호 변경 모달 -->
    <div v-if="showPasswordModal" class="modal-overlay">
      <div class="modal-content">
        <h2>비밀번호 변경</h2>
        <form @submit.prevent="handlePasswordChange" class="password-form">
          <div class="form-group">
            <label>현재 비밀번호</label>
            <input 
              type="password" 
              v-model="passwordForm.currentPassword"
              required
            />
          </div>
          <div class="form-group">
            <label>새 비밀번호</label>
            <input 
              type="password" 
              v-model="passwordForm.newPassword"
              required
            />
          </div>
          <div class="form-group">
            <label>새 비밀번호 확인</label>
            <input 
              type="password" 
              v-model="passwordForm.confirmPassword"
              required
            />
          </div>
          <div class="button-group">
            <button type="submit" class="edit-profile-link">변경</button>
            <button type="button" @click="showPasswordModal = false" class="edit-profile-link cancel">취소</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 회원 탈퇴 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h2>회원 탈퇴</h2>
        <p class="delete-warning">정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
        <div class="modal-buttons">
          <button @click="showDeleteModal = false" class="cancel-btn">취소</button>
          <button @click="handleDeleteAccount" class="delete-btn">탈퇴하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/utils/axios'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const toastStore = useToastStore()
const authStore = useAuthStore()

const userProfile = ref(null)
const showPasswordModal = ref(false)
const isEditing = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const editForm = ref({
  nickname: '',
  goalMessage: '',
  gender: '',
  birthYear: '',
  height: '',
  weight: '',
  diseaseCode: '',
  dietHabit: '',
  foodPreference: '',
  foodBlacklist: ''
})

const showDeleteModal = ref(false)

const initializeEditForm = () => {
  editForm.value = {
    nickname: userProfile.value.nickname || '',
    goalMessage: userProfile.value.goalMessage || '',
    gender: userProfile.value.gender || '',
    birthYear: userProfile.value.birthYear || '',
    height: userProfile.value.height || '',
    weight: userProfile.value.weight || '',
    diseaseCode: userProfile.value.diseaseCode || '',
    dietHabit: userProfile.value.dietHabit || '',
    foodPreference: userProfile.value.foodPreference || '',
    foodBlacklist: userProfile.value.foodBlacklist || ''
  }
}

const startEditing = () => {
  showPasswordModal.value = false
  isEditing.value = true
  initializeEditForm()
}

const cancelEditing = () => {
  isEditing.value = false
}

const handlePasswordModalOpen = () => {
  isEditing.value = false
  showPasswordModal.value = true
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const handlePasswordChange = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toastStore.show({
      title: '오류',
      message: '새 비밀번호가 일치하지 않습니다.',
      type: 'error'
    })
    return
  }

  try {
    await axiosInstance.put('/api/user', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    closePasswordModal()
    toastStore.show({
      title: '성공',
      message: '비밀번호가 성공적으로 변경되었습니다.',
      type: 'success'
    })
  } catch (error) {
    toastStore.show({
      title: '오류',
      message: error.response?.data?.message || '비밀번호 변경에 실패했습니다.',
      type: 'error'
    })
  }
}

const handleSave = async () => {
  try {
    const profileDataToSave = { ...editForm.value }
    
    // 프로필 정보 수정 시 비밀번호 관련 필드는 제거하고 보냄
    delete profileDataToSave.currentPassword;
    delete profileDataToSave.newPassword;
    delete profileDataToSave.confirmPassword;

    const response = await axiosInstance.put('/api/user', profileDataToSave)

    userProfile.value = response.data
    isEditing.value = false
    toastStore.show({
      title: '성공',
      message: '프로필이 성공적으로 수정되었습니다.',
      type: 'success'
    })
  } catch (error) {
    toastStore.show({
      title: '오류',
      message: '프로필 수정에 실패했습니다.',
      type: 'error'
    })
  }
}

const fetchUserProfile = async () => {
  try {
    console.log('API 호출로 데이터 가져오기')
    const response = await axiosInstance.get('/api/user')
    console.log('프로필 API 응답:', response.data)
    
    if (response.status === 200) {
      userProfile.value = response.data
    }
  } catch (error) {
    console.error('프로필 조회 실패:', error)
    if (error.response?.status === 401) {
      router.push('/login')
    }
  }
}

const getGenderLabel = (gender) => {
  const labels = {
    'MALE': '남성',
    'FEMALE': '여성',
    'OTHER': '기타'
  }
  return labels[gender] || '미지정'
}

const calculateAge = (birthYear) => {
  if (!birthYear) return '미입력'
  const currentYear = new Date().getFullYear()
  return currentYear - birthYear
}

const handleChallengeToggle = async () => {
  try {
    await axiosInstance.put('/api/user', {
      isChallengeEnabled: userProfile.value.isChallengeEnabled
    })
    
    toastStore.show({
      title: '성공',
      message: `챌린지 참여가 ${userProfile.value.isChallengeEnabled ? '활성화' : '비활성화'}되었습니다.`,
      type: 'success'
    })
  } catch (error) {
    userProfile.value.isChallengeEnabled = !userProfile.value.isChallengeEnabled
    
    toastStore.show({
      title: '오류',
      message: '챌린지 참여 상태 변경에 실패했습니다.',
      type: 'error'
    })
  }
}

const showDeleteConfirm = () => {
  showDeleteModal.value = true
}

const handleDeleteAccount = async () => {
  try {
    await axiosInstance.delete('/api/user')
    toastStore.show({
      title: '성공',
      message: '회원 탈퇴가 완료되었습니다.',
      type: 'success'
    })
    localStorage.removeItem('token')
    router.push('/login')
  } catch (error) {
    toastStore.show({
      title: '오류',
      message: '회원 탈퇴 처리 중 오류가 발생했습니다.',
      type: 'error'
    })
  } finally {
    showDeleteModal.value = false
  }
}

onMounted(() => {
  console.log('ProfilePage 마운트됨')
  fetchUserProfile()
})
</script>

<style scoped>
.profile-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.profile-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.profile-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-row {
  margin-bottom: 1rem;
}

.profile-row h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.goal {
  color: #666;
  margin: 0;
}

.profile-body {
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-group.full-width {
  grid-column: 1 / -1;
}

.info-group label {
  font-weight: 500;
  color: #666;
}

.edit-profile-link {
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid #22a366;
  color: #22a366;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.edit-profile-link:hover {
  background: #22a366;
  color: white;
}

.edit-profile-link.cancel {
  border-color: #666;
  color: #666;
}

.edit-profile-link.cancel:hover {
  background: #666;
  color: white;
}

.edit-profile-link.delete {
  border-color: #dc3545;
  color: #dc3545;
}

.edit-profile-link.delete:hover {
  background: #dc3545;
  color: white;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-start;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #22a366;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.loading {
  text-align: center;
  color: #666;
  padding: 2rem;
}

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
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
}

.modal-content h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  text-align: center;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #666;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.cancel-btn, .submit-btn {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: none;
  border: 1px solid #666;
  color: #666;
}

.submit-btn {
  background: #22a366;
  color: white;
  border: 1px solid #22a366;
}

.cancel-btn:hover {
  background: #666;
  color: white;
}

.submit-btn:hover {
  background: #1a8550;
}

.nickname-challenge-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.challenge-participation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.challenge-participation span {
  font-size: 0.9rem;
  color: #666;
}

.edit-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.delete-warning {
  color: #dc3545;
  text-align: center;
  margin: 1rem 0;
  font-weight: 500;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: 1px solid #dc3545;
}

.delete-btn:hover {
  background: #c82333;
}
</style> 