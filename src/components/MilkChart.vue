<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import type { DailyStats } from '@/types'

// Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Props {
  data: DailyStats[]
}

const props = defineProps<Props>()

// Fonction pour calculer la ligne de tendance linéaire
const calculateTrendLine = (data) => {
  const n = data.length
  if (n < 2) return data.map(() => 0)

  const sumX = data.reduce((sum, _, index) => sum + index, 0)
  const sumY = data.reduce((sum, value) => sum + value, 0)
  const sumXY = data.reduce((sum, value, index) => sum + index * value, 0)
  const sumXX = data.reduce((sum, _, index) => sum + index * index, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return data.map((_, index) => slope * index + intercept)
}

// Formatage des données pour le graphique
const chartData = computed(() => {
  const labels = props.data.map((stat) => {
    return new Date(stat.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  })

  const milkData = props.data.map((stat) => stat.biberonTotal)
  const trendLine = calculateTrendLine(milkData)

  return {
    labels,
    datasets: [
      {
        label: 'Quantité de lait (ml)',
        data: milkData,
        borderColor: '#4a86e8',
        backgroundColor: 'rgba(74, 134, 232, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#4a86e8',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Tendance',
        data: trendLine,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  }
})

// Configuration du graphique
const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Évolution de la quantité de lait sur 15 jours',
      font: {
        size: 16,
        weight: 'bold',
      },
    },
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#4a86e8',
      borderWidth: 1,
      callbacks: {
        label: (context) => `${context.parsed.y} ml`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 12,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        font: {
          size: 12,
        },
        callback: (value) => `${value} ml`,
      },
    },
  },
  elements: {
    point: {
      hoverBorderWidth: 3,
    },
  },
}))
</script>

<template>
  <div class="milk-chart">
    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.milk-chart {
  background-color: var(--surface-variant-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.chart-container {
  height: 300px;
  width: 100%;
}

@media (max-width: 600px) {
  .chart-container {
    height: 250px;
  }
}
</style>
