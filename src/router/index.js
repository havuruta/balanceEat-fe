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
      { path: 'contact', component: () => import('@/views/Contact/ContactView.vue') },
      { 
        path: 'mypage', 
        component: () => import('@/views/MyPage.vue'),
        meta: { requiresAuth: true }
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('@/views/Auth/LoginView.vue') }],
  },
  {
    path: '/register',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('@/views/Auth/RegisterView.vue') }],
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/NotFound/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 네비게이션 가드 추가
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 인증이 필요한 페이지에 접근할 때
  if (to.meta.requiresAuth) {
    console.log('인증이 필요한 페이지 접근. 현재 로그인 상태:', authStore._isLoggedIn)
    
    if (!authStore._isLoggedIn) {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      next('/login')
    } else {
      // 로그인된 경우 페이지 접근 허용
      next()
    }
  } else {
    // 인증이 필요없는 페이지는 그대로 진행
    next()
  }
})

export default router
