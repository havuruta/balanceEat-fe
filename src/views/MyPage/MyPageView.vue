<template>
  <div class="mypage-layout">
    <div class="mypage-container">
      <!-- <div class="auth-logo">
        <router-link to="/" class="logo-link">
          <img src="@/components/icons/logo.svg" alt="BalanceEat" height="48" />
          <span>BalanceEat</span>
        </router-link>
      </div> -->
      <div class="mypage-content">
        <h1 class="mypage-title">마이페이지</h1>
        <div class="button-container">
          <BaseButton
            color="secondary"
            full
            class="mypage-button"
            @click="goToEditProfile"
          >
            회원 정보 수정
          </BaseButton>
          <BaseButton
            color="secondary"
            full
            class="mypage-button"
            @click="goToProfile"
          >
            내 프로필
          </BaseButton>
        </div>
      </div>
      <!-- <footer class="auth-footer">
        <div class="footer-left">
          <span>balanceEat Corp.</span>
        </div>
        <div class="footer-right">
          <span>© JMG 2025</span>
        </div>
      </footer> -->
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()

const goToEditProfile = () => {
  router.push('/mypage/edit')
}

const goToProfile = () => {
  router.push('/mypage/profile')
}
</script>

<style scoped>
.mypage-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  background: #fff;
}

.mypage-container {
  min-width: 400px;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
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

.mypage-content {
  width: 100%;
  padding: 2rem;
}

.mypage-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mypage-button {
  height: 48px;
  font-size: 1.1rem;
  border-radius: 8px;
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
  margin-top: auto;
}

.footer-left {
  font-weight: bold;
  color: #22a366;
}

.footer-right {
  display: flex;
  flex-direction: column;
}
</style> 