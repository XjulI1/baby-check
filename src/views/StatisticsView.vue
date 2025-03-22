<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '@/stores/events'
import type { DailyStats } from '@/types'

const eventStore = useEventsStore()
const isLoading = ref(true)
const selectedPeriod = ref<number>(7) // Par défaut: 7 jours
const periods = [3, 7, 15] // Périodes disponibles en jours

// Chargement des données
onMounted(async () => {
  try {
    // Charger toutes les données nécessaires pour couvrir la période maximale
    await eventStore.loadEventsForPeriod(15) // 15 jours est la période maximum
  } finally {
    isLoading.value = false
  }
})

// Calculer les dates pour la période sélectionnée
const dateRange = computed(() => {
  const dates: string[] = []
  const today = new Date()

  for (let i = 0; i < selectedPeriod.value; i++) {
    const date = new Date()
    date.setDate(today.getDate() - i)
    dates.unshift(date.toISOString().split('T')[0]) // Ajouter au début pour avoir les dates en ordre chronologique
  }

  return dates
})

// Obtenir les statistiques pour chaque jour de la période
const periodStats = computed(() => {
  return dateRange.value.map((date) => eventStore.statsForDate(date))
})

// Calculer les statistiques totales pour la période
const totalStats = computed(() => {
  const total: DailyStats = {
    date: `Derniers ${selectedPeriod.value} jours`,
    pipiCount: 0,
    cacaCount: 0,
    biberonCount: 0,
    biberonTotal: 0,
    dodoCount: 0,
    dodoTotal: 0,
  }

  periodStats.value.forEach((stat) => {
    total.pipiCount += stat.pipiCount
    total.cacaCount += stat.cacaCount
    total.biberonCount += stat.biberonCount
    total.biberonTotal += stat.biberonTotal
    total.dodoCount += stat.dodoCount
    total.dodoTotal += stat.dodoTotal
  })

  return total
})

// Calculer les moyennes quotidiennes
const averageStats = computed(() => {
  const days = selectedPeriod.value
  if (days === 0) return null

  return {
    pipiCount: (totalStats.value.pipiCount / days).toFixed(1),
    cacaCount: (totalStats.value.cacaCount / days).toFixed(1),
    biberonCount: (totalStats.value.biberonCount / days).toFixed(1),
    biberonTotal: (totalStats.value.biberonTotal / days).toFixed(0),
    dodoCount: (totalStats.value.dodoCount / days).toFixed(1),
    dodoTotal: (totalStats.value.dodoTotal / days).toFixed(0),
  }
})

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const formatSleepDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}h${mins > 0 ? mins + 'm' : ''}`
  }
  return `${mins}m`
}
</script>

<template>
  <div class="statistics">
    <h1>Statistiques</h1>

    <div class="period-selector">
      <button
        v-for="period in periods"
        :key="period"
        @click="selectedPeriod = period"
        :class="{ active: selectedPeriod === period }"
      >
        {{ period }} jours
      </button>
    </div>

    <div v-if="isLoading" class="loading">Chargement des statistiques...</div>

    <div v-else class="stats-container">
      <div class="summary-stats">
        <h2>Moyennes quotidiennes</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">💧</div>
            <div class="stat-value">{{ averageStats?.pipiCount }}</div>
            <div class="stat-label">Pipi/jour</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💩</div>
            <div class="stat-value">{{ averageStats?.cacaCount }}</div>
            <div class="stat-label">Caca/jour</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🍼</div>
            <div class="stat-value">{{ averageStats?.biberonTotal }} ml</div>
            <div class="stat-label">Lait/jour</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">😴</div>
            <div class="stat-value">{{ formatSleepDuration(Number(averageStats?.dodoTotal)) }}</div>
            <div class="stat-label">Sommeil/jour</div>
          </div>
        </div>
      </div>

      <div class="total-stats">
        <h2>Totaux sur {{ selectedPeriod }} jours</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">💧</div>
            <div class="stat-value">{{ totalStats.pipiCount }}</div>
            <div class="stat-label">Pipi total</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💩</div>
            <div class="stat-value">{{ totalStats.cacaCount }}</div>
            <div class="stat-label">Caca total</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🍼</div>
            <div class="stat-value">{{ totalStats.biberonTotal }} ml</div>
            <div class="stat-label">Lait total</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">😴</div>
            <div class="stat-value">{{ formatSleepDuration(totalStats.dodoTotal) }}</div>
            <div class="stat-label">Sommeil total</div>
          </div>
        </div>
      </div>

      <div class="daily-breakdown">
        <h2>Détails quotidiens</h2>
        <div class="stats-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>💧 Pipi</th>
                <th>💩 Caca</th>
                <th>🍼 Lait</th>
                <th>😴 Sommeil</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stats in periodStats" :key="stats.date">
                <td>{{ formatDate(stats.date) }}</td>
                <td>{{ stats.pipiCount }}</td>
                <td>{{ stats.cacaCount }}</td>
                <td>{{ stats.biberonTotal }} ml</td>
                <td>{{ formatSleepDuration(stats.dodoTotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #4a86e8;
  text-align: center;
  margin-bottom: 24px;
}

h2 {
  margin: 15px 0;
  font-size: 1.2rem;
  color: #444;
}

.period-selector {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
}

.period-selector button {
  padding: 8px 15px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.period-selector button.active {
  background-color: #4a86e8;
  color: white;
  border-color: #3a76d8;
}

.loading {
  text-align: center;
  padding: 30px;
  color: #666;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.summary-stats,
.total-stats,
.daily-breakdown {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #4a86e8;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.stats-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f5f5;
  font-weight: 500;
}

tr:last-child td {
  border-bottom: none;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
