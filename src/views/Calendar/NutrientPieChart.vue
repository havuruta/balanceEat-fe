<template>
  <div class="pie-chart-wrapper">
    <Doughnut :data="chartData" :options="chartOptions" />
    <div class="legend">
      <div v-for="(label, i) in chartData.labels" :key="i" class="legend-item">
        <span
          class="legend-color"
          :style="{ background: chartData.datasets[0].backgroundColor[i] }"
        ></span>
        <span>{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
import { computed } from 'vue'
Chart.register(ArcElement, Tooltip, Legend)

// fake summary 데이터 (props로도 받을 수 있음)
const props = defineProps({
  summary: {
    type: Object,
    default: () => ({ protein: 20, fat: 15, carbohydrates: 60 }),
  },
})

const chartData = computed(() => ({
  labels: ['단백질', '지방', '탄수화물'],
  datasets: [
    {
      data: [props.summary.protein, props.summary.fat, props.summary.carbohydrates],
      backgroundColor: ['#4a90e2', '#f5a623', '#7ed957'],
      hoverOffset: 16,
    },
  ],
}))

const chartOptions = {
  cutout: '65%',
  animation: { animateRotate: true, duration: 1200 },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.label}: ${context.parsed}g`
        },
      },
    },
  },
}
</script>

<style scoped>
.pie-chart-wrapper {
  max-width: 320px;
  margin: 0 auto;
  padding: 1.5rem 0 0.5rem 0;
}
.legend {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 1.2rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1rem;
}
.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
}
</style>
