<template>
  <div class="login-layout">
    <div class="login-image">
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80"
        alt="healthy food"
      />
    </div>
    <div class="login-form-area">
      <div class="auth-logo">
        <router-link to="/" class="logo-link">
          <img src="@/components/icons/logo.svg" alt="BalanceEat" height="48" />
          <span>BalanceEat</span>
        </router-link>
      </div>
      <AuthFormWrapper title="다시 돌아와서 반갑습니다">
        <form class="login-form" @submit.prevent="onLogin">
          <BaseInput
            label="Login"
            placeholder="이메일 혹은 전화번호"
            v-model="loginId"
            :error="loginError"
          />
          <PasswordInput
            label="Password"
            placeholder="비밀번호"
            v-model="password"
            :error="passwordError"
            style="margin-top: 1.2rem"
          />
          <div class="login-form__options">
            <BaseToggle v-model="rememberMe" label="기억하기" />
            <FormHelperText link="#" class="forgot-link">
              <template #default> </template>
              <template #link>비밀번호를 잊어버리셨나요?</template>
            </FormHelperText>
          </div>
          <BaseButton
            color="secondary"
            full
            style="margin-top: 1.7rem; font-size: 1.1rem; height: 48px"
            >로그인</BaseButton
          >
        </form>
        <FormHelperText link="/register" class="signup-link">
          아직 계정이 없으신가요?
          <template #link>회원가입</template>
        </FormHelperText>
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
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AuthFormWrapper from '@/components/base/AuthFormWrapper.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import PasswordInput from '@/components/base/PasswordInput.vue'
import BaseToggle from '@/components/base/BaseToggle.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import FormHelperText from '@/components/base/FormHelperText.vue'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const loginId = ref('')
const password = ref('')
const rememberMe = ref(false)
const loginError = ref('')
const passwordError = ref('')

// isLoggedIn 상태 변화 감시
watch(() => authStore.isLoggedIn, (newValue) => {
  console.log('LoginView - 로그인 상태 변경:', newValue)
})

async function onLogin() {
  // 유효성 검사
  let isValid = true

  if (!loginId.value) {
    loginError.value = '아이디를 입력하세요.'
    isValid = false
  } else {
    loginError.value = ''
  }

  if (!password.value) {
    passwordError.value = '비밀번호를 입력하세요.'
    isValid = false
  } else {
    passwordError.value = ''
  }

  if (!isValid) return

  console.log('로그인 시도:', loginId.value)
  const success = await authStore.login(loginId.value, password.value)
  console.log('로그인 결과:', success)
  
  if (success) {
    console.log('로그인 성공, 홈으로 이동')
    router.push('/')
  } else {
    loginError.value = '로그인에 실패했습니다.'
  }
}
</script>

<style scoped>
:global(body) {
  background: #fff !important;
}
.login-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  gap: 4.5rem;
  background: #fff;
}
.login-image {
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
.login-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.07);
  background: #eee;
  display: block;
}
.login-form-area {
  min-width: 500px;
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
.login-form__options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.9rem;
  width: 100%;
}
.forgot-link {
  margin-left: 0;
  font-size: 0.97rem;
}
@media (max-width: 1100px) {
  .login-layout {
    gap: 2rem;
  }
  .login-image {
    min-width: 400px;
    min-height: 300px;
    max-width: 95vw;
    max-height: 360px;
  }
  .login-form-area {
    min-width: 0;
    max-width: 95vw;
  }
}
@media (max-width: 900px) {
  .login-layout {
    flex-direction: column;
    gap: 1.5rem;
    min-height: 100vh;
  }
  .login-image {
    margin-bottom: 1.5rem;
    padding: 0;
    min-width: 0;
    min-height: 0;
    max-width: 95vw;
    max-height: 320px;
  }
  .login-image img {
    width: 90vw;
    max-width: 400px;
    height: 180px;
  }
  .login-form-area {
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
