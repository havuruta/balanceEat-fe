import axiosInstance from '@/utils/axios'

const BASE_URL = '/api/nutrition'

export const nutritionApi = {
  // 모든 영양 정보 조회 (페이지네이션)
  getAllNutritions: async (page = 0, size = 10) => {
    const response = await axiosInstance.get(BASE_URL, {
      params: { page, size }
    })
    return response.data
  },

  // 영양 정보 검색 (페이지네이션)
  searchNutritions: async (name = null, category = null, page = 0, size = 10) => {
    const params = { page, size }
    if (name) params.name = name
    if (category) params.category = category
    
    const response = await axiosInstance.get(`${BASE_URL}/search`, { params })
    return response.data
  },

  // ID로 영양 정보 조회
  getNutritionById: async (id) => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`)
    return response.data
  }
} 