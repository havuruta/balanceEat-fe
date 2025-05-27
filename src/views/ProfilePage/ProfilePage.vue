<template>
  <div class="profile-page">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>프로필</h2>
        </div>
      </template>

      <el-form :model="userProfile" label-position="top">
        <el-form-item label="이메일">
          <el-input v-model="userProfile.email" disabled />
        </el-form-item>

        <el-form-item label="닉네임">
          <el-input v-model="userProfile.nickname" />
        </el-form-item>

        <el-form-item label="출생년도">
          <el-input-number v-model="userProfile.birthYear" :min="1900" :max="2024" />
        </el-form-item>

        <el-form-item label="성별">
          <el-select v-model="userProfile.gender" placeholder="성별을 선택하세요">
            <el-option label="남성" value="MALE" />
            <el-option label="여성" value="FEMALE" />
          </el-select>
        </el-form-item>

        <el-form-item label="체중 (kg)">
          <el-input-number v-model="userProfile.weight" :min="0" :max="500" />
        </el-form-item>

        <el-form-item label="신장 (cm)">
          <el-input-number v-model="userProfile.height" :min="0" :max="300" />
        </el-form-item>

        <el-form-item label="질병 코드">
          <el-input v-model="userProfile.diseaseCode" />
        </el-form-item>

        <el-form-item label="식습관">
          <el-input v-model="userProfile.dietHabit" />
        </el-form-item>

        <el-form-item label="음식 블랙리스트">
          <el-input v-model="userProfile.foodBlacklist" />
        </el-form-item>

        <el-form-item label="음식 선호도">
          <el-input v-model="userProfile.foodPreference" />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="userProfile.isChallengeEnabled">챌린지 활성화</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave">저장</el-button>
        </el-form-item>
      </el-form>

      <!-- 회원 탈퇴 버튼 추가 -->
      <div class="delete-account-section">
        <el-button type="danger" @click="showDeleteConfirm">회원 탈퇴</el-button>
      </div>
    </el-card>

    <!-- 회원 탈퇴 확인 모달 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="회원 탈퇴"
      width="30%"
      :close-on-click-modal="false"
    >
      <span>정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">취소</el-button>
          <el-button type="danger" @click="handleDeleteAccount">탈퇴하기</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axiosInstance from '@/api/axiosInstance'

const router = useRouter()
const userProfile = ref({
  email: '',
  nickname: '',
  birthYear: 0,
  gender: null,
  weight: 0,
  height: 0,
  diseaseCode: '',
  dietHabit: '',
  foodBlacklist: '',
  foodPreference: '',
  isChallengeEnabled: false
})

// 회원 탈퇴 관련 상태
const deleteDialogVisible = ref(false)

// 프로필 정보 가져오기
const fetchUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/api/users/profile')
    userProfile.value = response.data
  } catch (error) {
    console.error('프로필 정보를 가져오는데 실패했습니다:', error)
    ElMessage.error('프로필 정보를 가져오는데 실패했습니다.')
  }
}

// 프로필 저장
const handleSave = async () => {
  try {
    await axiosInstance.put('/api/users/profile', userProfile.value)
    ElMessage.success('프로필이 성공적으로 업데이트되었습니다.')
  } catch (error) {
    console.error('프로필 업데이트 실패:', error)
    ElMessage.error('프로필 업데이트에 실패했습니다.')
  }
}

// 회원 탈퇴 확인 모달 표시
const showDeleteConfirm = () => {
  deleteDialogVisible.value = true
}

// 회원 탈퇴 처리
const handleDeleteAccount = async () => {
  try {
    await axiosInstance.put(`/api/users/${userProfile.value.id}/deactivate`)
    ElMessage.success('회원 탈퇴가 완료되었습니다.')
    // 로그아웃 처리 및 로그인 페이지로 이동
    localStorage.removeItem('token')
    router.push('/login')
  } catch (error) {
    console.error('회원 탈퇴 실패:', error)
    ElMessage.error('회원 탈퇴 처리 중 오류가 발생했습니다.')
  } finally {
    deleteDialogVisible.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile-card {
  margin-bottom: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

/* 회원 탈퇴 섹션 스타일 */
.delete-account-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  text-align: center;
}

.delete-account-section .el-button {
  width: 200px;
}

/* 모달 스타일 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style> 