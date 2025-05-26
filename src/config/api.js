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
    ADD: '/api/diet/add',
    BATCH_ADD: '/api/diet/batch-add',
    UPDATE: '/api/diet/update',
    DELETE: '/api/diet/delete',
    EDIT: '/api/diet/edit',
    SUMMARIES: '/api/diet/summaries',
    DETAIL: '/api/diet/detail',
  },
  NUTRITION: {
    ALL: '/nutrition/all',
    SEARCH: '/nutrition/search'
  }
} 