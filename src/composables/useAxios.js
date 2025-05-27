import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  withCredentials: true
})

// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
instance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const authStore = useAuthStore()
    
    // 401 에러 처리 (인증 만료)
    if (error.response?.status === 401) {
      try {
        // 토큰 재발급 시도
        await authStore.refreshToken()
        // 재발급 성공시 실패했던 요청 재시도
        return instance(error.config)
      } catch (e) {
        // 재발급 실패시 로그아웃
        await authStore.logout()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    
    return Promise.reject(error)
  }
)

export function useAxios() {
  return instance
} 