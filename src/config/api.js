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
    ADD: '/diet/add',
    UPDATE: '/diet/update',
    DELETE: '/diet/delete',
    EDIT: '/diet/edit',
    SUMMARIES: '/diet/summaries'
  },
  NUTRITION: {
    ALL: '/nutrition/all',
    SEARCH: '/nutrition/search'
  }
} 