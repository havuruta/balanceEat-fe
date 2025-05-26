import axios from 'axios'
import { API_BASE_URL } from '@/config/api'
import { useAuthStore } from '@/stores/authStore'

// 인증이 필요한 axios 인스턴스
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // 쿠키 전송을 위한 추가 설정
  xsrfCookieName: 'JSESSIONID',
  xsrfHeaderName: 'X-XSRF-TOKEN'
})

// 인증이 필요없는 axios 인스턴스
export const publicAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

let isRefreshing = false
let refreshSubscribers = []
let refreshRetryCount = 0
const MAX_REFRESH_RETRY = 3
let isLoggingOut = false

// 토큰 재발급 후 대기 중인 요청들을 처리
const onRefreshed = () => {
  refreshSubscribers.forEach(callback => callback())
  refreshSubscribers = []
  refreshRetryCount = 0
}

// 토큰 재발급 중인 요청을 큐에 추가
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback)
}

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 로그아웃 중이면 요청 중단
    if (isLoggingOut) {
      return Promise.reject(new Error('로그아웃 중입니다.'))
    }

    console.log('요청 설정:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers,
      cookies: document.cookie
    })
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // 토큰이 만료되었거나 유효하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 로그아웃 요청인 경우 바로 로그아웃 처리
      if (originalRequest.url.includes('/auth/logout')) {
        isLoggingOut = true
        authStore._isLoggedIn.value = false
        authStore.user.value = null
        window.location.href = '/login'
        return Promise.reject(error)
      }

      // 이미 토큰 재발급 중이면 대기
      if (isRefreshing) {
        return new Promise(resolve => {
          addRefreshSubscriber(() => {
            resolve(axiosInstance(originalRequest))
          })
        })
      }

      // 최대 재시도 횟수 초과 시 로그아웃
      if (refreshRetryCount >= MAX_REFRESH_RETRY) {
        console.error('토큰 재발급 최대 재시도 횟수 초과')
        isLoggingOut = true
        authStore._isLoggedIn.value = false
        authStore.user.value = null
        window.location.href = '/login'
        return Promise.reject(error)
      }

      originalRequest._retry = true
      isRefreshing = true
      refreshRetryCount++

      try {
        // 토큰 재발급 시도
        console.log('토큰 재발급 시도 - 현재 쿠키:', document.cookie)
        const response = await axiosInstance.post('/auth/reissue', {}, {
          withCredentials: true
        })
        console.log('토큰 재발급 응답:', response)
        isRefreshing = false
        onRefreshed()
        
        // 원래 요청 재시도
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        console.error('토큰 재발급 실패:', refreshError)
        isRefreshing = false
        
        // 최대 재시도 횟수를 초과한 경우에만 로그아웃
        if (refreshRetryCount >= MAX_REFRESH_RETRY) {
          console.error('토큰 재발급 최대 재시도 횟수 초과')
          isLoggingOut = true
          authStore._isLoggedIn.value = false
          authStore.user.value = null
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance 