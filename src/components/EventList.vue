<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useEventsStore } from '@/stores/events'

const eventStore = useEventsStore()
const currentDate = ref(new Date().toISOString().split('T')[0])

// Charger les événements pour la date courante et tous les événements au montage
onMounted(async () => {
  await eventStore.loadEventsForDate(currentDate.value)
})

// Recharger les événements quand la date change
watch(currentDate, async (newDate) => {
  await eventStore.loadEventsForDate(newDate)
})

const todayEvents = computed(() => {
  return eventStore
    .eventsForDate(currentDate.value)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getEventIcon = (type: string): string => {
  switch (type) {
    case 'pipi':
      return '💧'
    case 'caca':
      return '💩'
    case 'biberon':
      return '🍼'
    case 'dodo':
      return '😴'
    default:
      return '❓'
  }
}

const formatSleepDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}h ${mins > 0 ? mins + 'm' : ''}`
  }
  return `${mins}m`
}

const getPreviousDay = () => {
  const date = new Date(currentDate.value)
  date.setDate(date.getDate() - 1)
  currentDate.value = date.toISOString().split('T')[0]
}

const getNextDay = () => {
  const date = new Date(currentDate.value)
  date.setDate(date.getDate() + 1)
  const today = new Date().toISOString().split('T')[0]
  if (date.toISOString().split('T')[0] <= today) {
    currentDate.value = date.toISOString().split('T')[0]
  }
}

const removeEvent = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
    await eventStore.removeEvent(id)
  }
}
</script>

<template>
  <div class="event-list">
    <div class="date-selector">
      <button @click="getPreviousDay" class="nav-button">&lt;</button>
      <h3>
        {{ new Date(currentDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) }}
      </h3>
      <button @click="getNextDay" class="nav-button">&gt;</button>
    </div>

    <div class="daily-stats">
      <div class="stat-item">
        <span class="emoji">💧</span>
        <span class="count">{{ eventStore.statsForDate(currentDate).pipiCount }}</span>
      </div>
      <div class="stat-item">
        <span class="emoji">💩</span>
        <span class="count">{{ eventStore.statsForDate(currentDate).cacaCount }}</span>
      </div>
      <div class="stat-item">
        <span class="emoji">🍼</span>
        <span class="count">{{ eventStore.statsForDate(currentDate).biberonTotal }} cl</span>
      </div>
      <div class="stat-item">
        <span class="emoji">😴</span>
        <span class="count">{{
          eventStore.statsForDate(currentDate).dodoTotal > 0
            ? formatSleepDuration(eventStore.statsForDate(currentDate).dodoTotal)
            : '0'
        }}</span>
      </div>
    </div>

    <!-- Ajout d'un indicateur de chargement -->
    <div v-if="eventStore.isLoading" class="loading">Chargement en cours...</div>

    <!-- Affichage des erreurs -->
    <div v-if="eventStore.error" class="error">
      {{ eventStore.error }}
    </div>

    <div v-if="todayEvents.length === 0" class="empty-state">
      Aucun événement pour cette journée
    </div>

    <ul v-else class="events">
      <li v-for="event in todayEvents" :key="event.id" class="event-item">
        <div class="event-icon">{{ getEventIcon(event.type) }}</div>
        <div class="event-details">
          <div class="event-time">{{ formatTime(event.timestamp) }}</div>
          <div class="event-type">
            {{ event.type.charAt(0).toUpperCase() + event.type.slice(1) }}
            <span v-if="event.quantity && event.type === 'biberon'" class="event-quantity"
              >{{ event.quantity }} cl</span
            >
            <span v-if="event.quantity && event.type === 'dodo'" class="event-quantity">{{
              formatSleepDuration(event.quantity)
            }}</span>
          </div>
          <div v-if="event.notes" class="event-notes">{{ event.notes }}</div>
        </div>
        <button @click="removeEvent(event.id)" class="delete-button">×</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.event-list {
  margin-top: 20px;
}

.date-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.nav-button {
  background-color: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.daily-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.emoji {
  font-size: 24px;
  margin-right: 5px;
}

.count {
  font-size: 18px;
  font-weight: bold;
}

.events {
  list-style: none;
  padding: 0;
  margin: 0;
}

.event-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.event-icon {
  font-size: 24px;
  margin-right: 16px;
}

.event-details {
  flex: 1;
}

.event-time {
  font-size: 14px;
  color: #666;
}

.event-type {
  font-weight: bold;
}

.event-quantity {
  margin-left: 8px;
  color: #4a86e8;
}

.event-notes {
  font-size: 14px;
  margin-top: 4px;
  color: #666;
}

.delete-button {
  background: none;
  border: none;
  color: #ff5252;
  font-size: 20px;
  cursor: pointer;
  padding: 0 5px;
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: #666;
  font-style: italic;
}

.loading,
.error {
  text-align: center;
  padding: 16px;
  margin-top: 16px;
}

.error {
  color: #f44336;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>
