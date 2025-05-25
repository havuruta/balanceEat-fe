import axios from 'axios'
import { API_BASE_URL } from '@/config/api'
import { useAuthStore } from '@/stores/authStore'

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키를 포함하여 요청
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let refreshSubscribers = []

// 토큰 재발급 후 대기 중인 요청들을 처리
const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

// 토큰 재발급 중인 요청을 큐에 추가
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback)
}

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    // 응답 데이터를 가공
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 재발급 중이면 대기
        return new Promise(resolve => {
          addRefreshSubscriber(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosInstance(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 토큰 재발급 시도
        await authStore.reissueToken()
        isRefreshing = false
        onRefreshed(authStore.token)
        
        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${authStore.token}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        // 토큰 재발급 실패 시 로그아웃 처리
        await authStore.logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance 