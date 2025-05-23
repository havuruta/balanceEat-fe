import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키를 포함하여 요청
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 전에 수행할 작업
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
    if (error.response) {
      // 401 에러 처리 (토큰 만료)
      if (error.response.status === 401) {
        try {
          // 토큰 재발급 시도
          await axiosInstance.post('/auth/reissue')
          // 원래 요청 재시도
          return axiosInstance(error.config)
        } catch (refreshError) {
          // 토큰 재발급 실패 시 로그인 페이지로 이동
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance 