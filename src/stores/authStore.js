import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from '@/utils/axios'
import { API_ROUTES } from '@/config/api'

export const useAuthStore = defineStore('auth', () => {
  const _isLoggedIn = ref(false)
  const user = ref(null)

  // computed 속성으로 isLoggedIn 상태를 노출
  const isLoggedIn = computed(() => {
    console.log('authStore - isLoggedIn getter 호출:', _isLoggedIn.value)
    return _isLoggedIn.value
  })

  async function login(email, password) {
    try {
      console.log('로그인 시도:', email)
      const response = await axiosInstance.post(API_ROUTES.AUTH.LOGIN, {
        email,
        password
      })

      console.log('로그인 응답:', response)
      if (response.status === 200) {
        console.log('로그인 성공, 상태 변경')
        _isLoggedIn.value = true
        user.value = response.data.user
        return true
      }
      return false
    } catch (error) {
      console.error('로그인 중 오류 발생:', error)
      return false
    }
  }

  async function logout() {
    try {
      console.log('로그아웃 시도')
      const response = await axiosInstance.post(API_ROUTES.AUTH.LOGOUT)

      console.log('로그아웃 응답:', response)
      if (response.status === 200) {
        console.log('로그아웃 성공, 상태 변경')
        _isLoggedIn.value = false
        user.value = null
        return true
      }
      return false
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error)
      return false
    }
  }

  return {
    isLoggedIn,
    _isLoggedIn,
    user,
    login,
    logout
  }
}, {
  persist: {
    paths: ['_isLoggedIn', 'user'],
    storage: localStorage,
    key: 'auth-store'
  }
}) 