export const API_BASE_URL = 'http://localhost:8080'

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    SIGNUP: '/auth/signup',
    REISSUE: '/auth/reissue'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update'
  },
  DIET: {
    ADD: '/api/diets',
    BATCH_ADD: '/api/diets',
    UPDATE: '/api/diets',
    DELETE: '/api/diets',
    EDIT: '/api/diets',
    SUMMARIES: '/api/diets/summaries',
    DETAIL: '/api/diets/detail',
  },
  NUTRITION: {
    ALL: '/nutrition/all',
    SEARCH: '/nutrition/search'
  }
} 