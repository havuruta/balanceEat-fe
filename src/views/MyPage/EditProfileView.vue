<template>
  <div class="edit-profile-layout">
    <div class="edit-profile-container">
      <div class="edit-profile-content">
        <h1 class="edit-profile-title">회원 정보 수정</h1>
        <form class="edit-profile-form" @submit.prevent="handleSubmit">
          <BaseInput
            v-model="formData.email"
            label="이메일"
            :value="formData.email"
            disabled
          />
          <BaseInput
            v-model="formData.nickname"
            label="닉네임"
            :value="formData.nickname"
            placeholder="닉네임을 입력하세요"
            :error="errors.nickname"
          />
          <PasswordInput
            v-model="formData.currentPassword"
            label="현재 비밀번호"
            placeholder="현재 비밀번호를 입력하세요"
            :error="errors.currentPassword"
          />
          <PasswordInput
            v-model="formData.newPassword"
            label="새 비밀번호 (선택사항)"
            placeholder="새 비밀번호를 입력하세요"
            :error="errors.newPassword"
          />
          <PasswordInput
            v-model="formData.confirmPassword"
            label="새 비밀번호 확인"
            placeholder="새 비밀번호를 다시 입력하세요"
            :error="errors.confirmPassword"
          />
          <div class="button-group">
            <BaseButton
              type="button"
              color="secondary"
              class="cancel-button"
              @click="goBack"
            >
              취소
            </BaseButton>
            <BaseButton
              type="submit"
              color="primary"
              class="submit-button"
            >
              수정하기
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/base/BaseInput.vue'
import PasswordInput from '@/components/base/PasswordInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import axiosInstance from '@/utils/axios'
import { API_ROUTES } from '@/config/api'

const router = useRouter()

const formData = ref({
  email: '',
  nickname: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = ref({
  nickname: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(async () => {
  try {
    const response = await axiosInstance.get(API_ROUTES.USER.PROFILE)
    formData.value = {
      ...formData.value,
      email: response.data.email || '',
      nickname: response.data.nickname || ''
    }
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error)
    alert('사용자 정보를 불러오는데 실패했습니다.')
    router.push('/mypage')
  }
})

const validateForm = () => {
  let isValid = true
  errors.value = {}

  if (!formData.value.nickname.trim()) {
    errors.value.nickname = '닉네임을 입력해주세요.'
    isValid = false
  }

  if (!formData.value.currentPassword) {
    errors.value.currentPassword = '현재 비밀번호를 입력해주세요.'
    isValid = false
  }

  if (formData.value.newPassword) {
    if (formData.value.newPassword.length < 8) {
      errors.value.newPassword = '비밀번호는 8자 이상이어야 합니다.'
      isValid = false
    }

    if (formData.value.newPassword !== formData.value.confirmPassword) {
      errors.value.confirmPassword = '새 비밀번호가 일치하지 않습니다.'
      isValid = false
    }
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    const updateData = {
      nickname: formData.value.nickname,
      currentPassword: formData.value.currentPassword
    }

    if (formData.value.newPassword) {
      updateData.newPassword = formData.value.newPassword
    }

    await axiosInstance.put(API_ROUTES.USER.UPDATE, updateData)
    alert('회원 정보가 성공적으로 수정되었습니다.')
    router.push('/mypage')
  } catch (error) {
    console.error('회원 정보 수정 실패:', error)
    if (error.response?.status === 401) {
      errors.value.currentPassword = '현재 비밀번호가 일치하지 않습니다.'
    } else if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else {
      alert('회원 정보 수정에 실패했습니다.')
    }
  }
}

const goBack = () => {
  router.push('/mypage')
}
</script>

<style scoped>
.edit-profile-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  background: #fff;
  padding: 2rem;
}

.edit-profile-container {
  min-width: 400px;
  max-width: 500px;
  width: 100%;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

.edit-profile-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.edit-profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button,
.submit-button {
  flex: 1;
  height: 48px;
  font-size: 1.1rem;
}
</style> 