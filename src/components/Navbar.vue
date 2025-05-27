<template>
  <nav class="navbar">
    <div class="navbar__logo">
      <router-link to="/" class="logo-link">
        <img src="@/components/icons/logo.svg" alt="BalanceEat" height="40" />
        <span>BalanceEat</span>
      </router-link>
    </div>
    <ul class="navbar__menu">
      <li><router-link to="/" exact-active-class="active" exact>메인</router-link></li>
      <li><router-link to="/nutrition" exact-active-class="active">영양 정보 조회</router-link></li>
      <li><router-link to="/calendar" exact-active-class="active">나의 식단 달력</router-link></li>
      <li><router-link to="/challenge" exact-active-class="active">챌린지</router-link></li>
    </ul>
    <div class="navbar__auth">
      <template v-if="isLoggedIn">
        <router-link to="/profile">
          <NavbarButton color="secondary">마이페이지</NavbarButton>
        </router-link>
        <NavbarButton color="danger" @click="handleLogout">로그아웃</NavbarButton>
      </template>
      <template v-else>
        <router-link to="/login">
          <NavbarButton color="secondary">로그인</NavbarButton>
        </router-link>
        <router-link to="/register">
          <NavbarButton color="primary">회원가입</NavbarButton>
        </router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import NavbarButton from './NavbarButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

async function handleLogout() {
  console.log('로그아웃 버튼 클릭')
  const success = await authStore.logout()
  if (success) {
    console.log('로그아웃 성공, 로그인 페이지로 이동')
    router.push('/login')
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  height: 7vh;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 2rem;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}
.navbar__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  font-size: 1.3rem;
}
.navbar__logo .logo-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}
.navbar__menu {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.navbar__menu li {
  font-size: 1rem;
}
.navbar__menu a {
  text-decoration: none;
  color: #222;
  font-weight: 500;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  transition:
    background 0.15s,
    color 0.15s;
}
.navbar__menu a.active {
  color: #22a366;
  background: #e6f4ea;
}
.navbar__menu a:hover {
  background: #f5f5f5;
}
.navbar__auth {
  display: flex;
  gap: 0.5rem;
}
</style> 