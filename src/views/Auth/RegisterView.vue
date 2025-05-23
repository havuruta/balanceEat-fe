<template>
  <div class="register-layout">
    <div class="register-image">
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80"
        alt="healthy food"
      />
    </div>
    <div class="register-form-area">
      <div class="auth-logo">
        <router-link to="/" class="logo-link">
          <img src="@/components/icons/logo.svg" alt="BalanceEat" height="48" />
          <span>BalanceEat</span>
        </router-link>
      </div>
      <AuthFormWrapper title="회원가입">
        <form class="register-form" @submit.prevent="onRegister">
          <BaseInput 
            label="이메일" 
            placeholder="이메일을 입력하세요" 
            v-model="email" 
            :error="emailError" 
          />
          <PasswordInput
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            v-model="password"
            :error="passwordError"
            style="margin-top: 1.2rem"
          />
          <PasswordInput
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력하세요"
            v-model="passwordConfirm"
            :error="passwordConfirmError"
            style="margin-top: 1.2rem"
          />
          <BaseInput 
            label="닉네임" 
            placeholder="닉네임을 입력하세요" 
            v-model="nickname" 
            :error="nicknameError" 
            style="margin-top: 1.2rem"
          />
          <BaseInput 
            label="출생년도" 
            placeholder="출생년도를 입력하세요" 
            v-model="birthYear" 
            type="number"
            style="margin-top: 1.2rem"
          />
          <BaseSelect
            label="성별"
            v-model="gender"
            :options="genderOptions"
            style="margin-top: 1.2rem"
          />
          <BaseInput 
            label="몸무게" 
            placeholder="몸무게(kg)" 
            v-model="weight" 
            type="number"
            style="margin-top: 1.2rem"
          />
          <BaseInput 
            label="키" 
            placeholder="키(cm)" 
            v-model="height" 
            type="number"
            style="margin-top: 1.2rem"
          />
          <BaseButton
            color="secondary"
            full
            style="margin-top: 1.7rem; font-size: 1.1rem; height: 48px"
            >회원 가입</BaseButton
          >
          <router-link to="/login">
            <BaseButton
              color="danger"
              full
              style="margin-top: 0.7rem; font-size: 1.1rem; height: 48px"
              @click.prevent="goLogin"
              >로그인 화면으로 돌아가기</BaseButton
            >
          </router-link>
        </form>
      </AuthFormWrapper>
      <footer class="auth-footer">
        <div class="footer-left">
          <span>balanceEat Corp.</span>
        </div>
        <div class="footer-right">
          <span>© JMG 2025</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthFormWrapper from '@/components/base/AuthFormWrapper.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import PasswordInput from '@/components/base/PasswordInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

const router = useRouter()

// 폼 데이터
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const nickname = ref('')
const birthYear = ref('')
const gender = ref('')
const weight = ref('')
const height = ref('')

// 에러 메시지
const emailError = ref('')
const passwordError = ref('')
const passwordConfirmError = ref('')
const nicknameError = ref('')

// 성별 옵션
const genderOptions = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
  { value: 'OTHER', label: '기타' }
]

async function onRegister() {
  // 유효성 검사
  let isValid = true

  if (!email.value) {
    emailError.value = '이메일을 입력하세요.'
    isValid = false
  } else {
    emailError.value = ''
  }

  if (!password.value) {
    passwordError.value = '비밀번호를 입력하세요.'
    isValid = false
  } else {
    passwordError.value = ''
  }

  if (password.value !== passwordConfirm.value) {
    passwordConfirmError.value = '비밀번호가 일치하지 않습니다.'
    isValid = false
  } else {
    passwordConfirmError.value = ''
  }

  if (!nickname.value) {
    nicknameError.value = '닉네임을 입력하세요.'
    isValid = false
  } else {
    nicknameError.value = ''
  }

  if (!isValid) return

  try {
    const response = await fetch('http://localhost:8080/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        passwordConfirm: passwordConfirm.value,
        nickname: nickname.value,
        birthYear: parseInt(birthYear.value) || 0,
        gender: gender.value,
        weight: parseInt(weight.value) || 0,
        height: parseInt(height.value) || 0
      })
    })

    if (response.ok) {
      router.push('/login')
    } else {
      const error = await response.json()
      // 에러 처리
      if (error.message.includes('이메일')) {
        emailError.value = error.message
      } else if (error.message.includes('비밀번호')) {
        passwordError.value = error.message
      }
    }
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error)
  }
}

function goLogin() {
  router.push('/login')
}
</script>

<style scoped>
.register-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  gap: 4.5rem;
  background: #fff;
}
.register-image {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  border: 2px solid #4cb6ff;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 700px;
  min-height: 525px;
  max-width: 900px;
  max-height: 675px;
  aspect-ratio: 4/3;
  overflow: hidden;
}
.register-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.07);
  background: #eee;
  display: block;
}
.register-form-area {
  min-width: 500px;
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 600px;
  max-height: 700px;
  height: 100%;
}
.auth-logo {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2.2rem;
  margin-top: 0.5rem;
}
.auth-logo .logo-link {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
  color: inherit;
}
.auth-logo img {
  height: 48px;
}
.auth-footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.98rem;
  color: #888;
  padding: 1.5rem 0 0.5rem 0;
  box-sizing: border-box;
}
.footer-left {
  font-weight: bold;
  color: #22a366;
}
.footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
}
.register-form {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 100%;
  overflow-y: auto;
  max-height: 420px;
  padding-right: 8px;
}
@media (max-width: 1100px) {
  .register-layout {
    gap: 2rem;
  }
  .register-image {
    min-width: 400px;
    min-height: 300px;
    max-width: 95vw;
    max-height: 360px;
  }
  .register-form-area {
    min-width: 0;
    max-width: 95vw;
  }
}
@media (max-width: 900px) {
  .register-layout {
    flex-direction: column;
    gap: 1.5rem;
    min-height: 100vh;
  }
  .register-image {
    margin-bottom: 1.5rem;
    padding: 0;
    min-width: 0;
    min-height: 0;
    max-width: 95vw;
    max-height: 320px;
  }
  .register-image img {
    width: 90vw;
    max-width: 400px;
    height: 180px;
  }
  .register-form-area {
    min-width: 0;
    max-width: 95vw;
  }
  .auth-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 1.2rem 0 1rem 0;
    font-size: 0.95rem;
  }
  .footer-right {
    align-items: flex-start;
  }
}
</style>
