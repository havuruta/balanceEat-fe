import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/views/Main/MainView.vue') },
      { path: 'nutrition', component: () => import('@/views/Nutrition/NutritionListView.vue') },
      { path: 'calendar', component: () => import('@/views/Calendar/CalendarView.vue') },
      { path: 'contact', component: () => import('@/views/Contact/ContactView.vue') },
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

export default router
