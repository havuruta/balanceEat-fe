import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/views/Main/MainView.vue') },
      { path: 'nutrition', component: () => import('@/views/Nutrition/NutritionListView.vue') },
      { path: 'calendar', component: () => import('@/views/Calendar/CalendarView.vue') },
      { path: 'challenge', component: () => import('@/views/Challenge/ChallengeView.vue') },
      { path: 'profile', component: () => import('@/views/MyPage/ProfilePage.vue'), meta: { requiresAuth: true } },
      { path: 'ai-diet', component: () => import('@/views/AIDietView.vue'), meta: { requiresAuth: true } },
      { path: 'contact', component: () => import('@/views/Contact/ContactView.vue') }
    ]
  },
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('@/views/Auth/LoginView.vue') }]
  },
  {
    path: '/register',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('@/views/Auth/RegisterView.vue') }]
  },
  {
    path: '/diet/detail',
    name: 'DietDetail',
    component: () => import('@/views/Diet/DietDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/NotFound/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 네비게이션 가드 추가
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // requiresAuth 메타 필드가 있는 라우트에 대해 인증 검사
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isLoggedIn) {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
