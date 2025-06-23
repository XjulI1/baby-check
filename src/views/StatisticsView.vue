<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useEventVisibility } from '@/composables/useEventVisibility'
import AppHeader from '@/components/AppHeader.vue'
import MilkChart from '@/components/MilkChart.vue'
import type { DailyStats } from '@/types'

const eventStore = useEventsStore()
const { isEventTypeVisible } = useEventVisibility()
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
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  for (let i = 0; i < selectedPeriod.value; i++) {
    const date = new Date()
    date.setDate(yesterday.getDate() - i)
    dates.unshift(date.toISOString().split('T')[0]) // Ajouter au début pour avoir les dates en ordre chronologique
  }

  return dates
})

// Calculer les dates pour le graphique du lait (toujours 15 jours)
const milkChartDateRange = computed(() => {
  const dates: string[] = []
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  for (let i = 0; i < 15; i++) {
    // Toujours 15 jours pour le graphique
    const date = new Date()
    date.setDate(yesterday.getDate() - i)
    dates.unshift(date.toISOString().split('T')[0])
  }

  return dates
})

// Obtenir les statistiques pour chaque jour de la période
const periodStats = computed(() => {
  return dateRange.value.map((date) => eventStore.statsForDate(date))
})

// Obtenir les statistiques pour le graphique du lait (15 jours)
const milkChartStats = computed(() => {
  return milkChartDateRange.value.map((date) => eventStore.statsForDate(date))
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
    allaitementCount: 0,
  }

  periodStats.value.forEach((stat) => {
    total.pipiCount += stat.pipiCount
    total.cacaCount += stat.cacaCount
    total.biberonCount += stat.biberonCount
    total.biberonTotal += stat.biberonTotal
    total.dodoCount += stat.dodoCount
    total.dodoTotal += stat.dodoTotal
    total.allaitementCount += stat.allaitementCount
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
    allaitementCount: (totalStats.value.allaitementCount / days).toFixed(1),
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
    <AppHeader />

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
          <div v-if="isEventTypeVisible('biberon')" class="stat-card">
            <div class="stat-icon">🍼</div>
            <div class="stat-value">{{ averageStats?.biberonTotal }} ml</div>
            <div class="stat-label">Lait/jour</div>
          </div>
          <div v-if="isEventTypeVisible('allaitement')" class="stat-card">
            <div class="stat-icon">🤱</div>
            <div class="stat-value">{{ averageStats?.allaitementCount }}</div>
            <div class="stat-label">Allaitement/jour</div>
          </div>
          <div v-if="isEventTypeVisible('pipi')" class="stat-card">
            <div class="stat-icon">💧</div>
            <div class="stat-value">{{ averageStats?.pipiCount }}</div>
            <div class="stat-label">Pipi/jour</div>
          </div>
          <div v-if="isEventTypeVisible('caca')" class="stat-card">
            <div class="stat-icon">💩</div>
            <div class="stat-value">{{ averageStats?.cacaCount }}</div>
            <div class="stat-label">Caca/jour</div>
          </div>
          <div v-if="isEventTypeVisible('dodo')" class="stat-card">
            <div class="stat-icon">😴</div>
            <div class="stat-value">{{ formatSleepDuration(Number(averageStats?.dodoTotal)) }}</div>
            <div class="stat-label">Sommeil/jour</div>
          </div>
        </div>
      </div>

      <div class="total-stats">
        <h2>Totaux sur {{ selectedPeriod }} jours</h2>
        <div class="stats-grid">
          <div v-if="isEventTypeVisible('biberon')" class="stat-card">
            <div class="stat-icon">🍼</div>
            <div class="stat-value">{{ totalStats.biberonTotal }} ml</div>
            <div class="stat-label">Lait total</div>
          </div>
          <div v-if="isEventTypeVisible('allaitement')" class="stat-card">
            <div class="stat-icon">🤱</div>
            <div class="stat-value">{{ totalStats.allaitementCount }}</div>
            <div class="stat-label">Allaitement total</div>
          </div>
          <div v-if="isEventTypeVisible('pipi')" class="stat-card">
            <div class="stat-icon">💧</div>
            <div class="stat-value">{{ totalStats.pipiCount }}</div>
            <div class="stat-label">Pipi total</div>
          </div>
          <div v-if="isEventTypeVisible('caca')" class="stat-card">
            <div class="stat-icon">💩</div>
            <div class="stat-value">{{ totalStats.cacaCount }}</div>
            <div class="stat-label">Caca total</div>
          </div>
          <div v-if="isEventTypeVisible('dodo')" class="stat-card">
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
                <th v-if="isEventTypeVisible('biberon')">🍼 Lait</th>
                <th v-if="isEventTypeVisible('allaitement')">🤱 Allaitement</th>
                <th v-if="isEventTypeVisible('pipi')">💧 Pipi</th>
                <th v-if="isEventTypeVisible('caca')">💩 Caca</th>
                <th v-if="isEventTypeVisible('dodo')">😴 Sommeil</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stats in periodStats" :key="stats.date">
                <td>{{ formatDate(stats.date) }}</td>
                <td v-if="isEventTypeVisible('biberon')">{{ stats.biberonTotal }} ml</td>
                <td v-if="isEventTypeVisible('allaitement')">{{ stats.allaitementCount }}</td>
                <td v-if="isEventTypeVisible('pipi')">{{ stats.pipiCount }}</td>
                <td v-if="isEventTypeVisible('caca')">{{ stats.cacaCount }}</td>
                <td v-if="isEventTypeVisible('dodo')">
                  {{ formatSleepDuration(stats.dodoTotal) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Graphique de l'évolution du lait -->
      <MilkChart v-if="isEventTypeVisible('biberon')" :data="milkChartStats" />
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
  color: var(--primary-color);
}

.period-selector {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
}

.period-selector button {
  padding: 8px 15px;
  background-color: var(--surface-variant-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  color: var(--text-primary-color);
}

.period-selector button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-hover-color);
}

.loading {
  text-align: center;
  padding: 30px;
  color: var(--text-secondary-color);
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.summary-stats,
.total-stats,
.daily-breakdown {
  background-color: var(--surface-variant-color);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.stat-card {
  background-color: var(--surface-color);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 1px 3px var(--shadow-color);
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary-color);
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
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: var(--surface-color);
  font-weight: 500;
  color: var(--text-primary-color);
}

td {
  color: var(--text-primary-color);
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
