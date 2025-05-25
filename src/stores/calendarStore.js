import { defineStore } from 'pinia'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    showNutritionModal: false,
    selectedFood: null,
    // 필요시 다른 모달/공통 상태도 추가 가능
  }),
  actions: {
    openNutritionModal() {
      this.showNutritionModal = true
    },
    closeNutritionModal() {
      this.showNutritionModal = false
    },
    setSelectedNutrition(nutrition) {
      this.selectedNutrition = nutrition
    },
  },
})
