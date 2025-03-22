import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { BabyEvent, DailyStats, EventType } from '@/types'
import * as api from '@/api/events'

export const useEventsStore = defineStore('events', () => {
  const events = ref<BabyEvent[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Ajouter un nouvel événement
  async function addEvent(
    type: EventType,
    quantity?: number,
    notes?: string,
    timestamp?: Date,
  ): Promise<void> {
    try {
      isLoading.value = true
      error.value = null

      const newEvent: BabyEvent = {
        id: Date.now().toString(),
        type,
        timestamp: timestamp || new Date(),
        quantity,
        notes,
      }

      await api.addEvent(newEvent)
      events.value.push(newEvent)
    } catch (err) {
      error.value = "Erreur lors de l'ajout de l'événement"
      console.error(error.value, err)
    } finally {
      isLoading.value = false
    }
  }

  // Supprimer un événement
  async function removeEvent(id: string): Promise<void> {
    try {
      isLoading.value = true
      error.value = null

      await api.deleteEvent(id)

      const index = events.value.findIndex((event) => event.id === id)
      if (index !== -1) {
        events.value.splice(index, 1)
      }
    } catch (err) {
      error.value = "Erreur lors de la suppression de l'événement"
      console.error(error.value, err)
    } finally {
      isLoading.value = false
    }
  }

  // Charger tous les événements depuis la base de données
  async function loadEvents(): Promise<void> {
    try {
      isLoading.value = true
      error.value = null

      const data = await api.getAllEvents()
      events.value = data
    } catch (err) {
      error.value = 'Erreur lors du chargement des événements'
      console.error(error.value, err)
      events.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Charger les événements d'une date spécifique
  async function loadEventsForDate(dateString: string): Promise<void> {
    try {
      isLoading.value = true
      error.value = null

      const data = await api.getEventsByDate(dateString)

      // Mettre à jour seulement les événements du jour spécifié
      // et garder les autres événements en mémoire
      const otherEvents = events.value.filter((event) => {
        const eventDate = new Date(event.timestamp).toISOString().split('T')[0]
        return eventDate !== dateString
      })

      events.value = [...otherEvents, ...data]
    } catch (err) {
      error.value = `Erreur lors du chargement des événements pour la date ${dateString}`
      console.error(error.value, err)
    } finally {
      isLoading.value = false
    }
  }

  // Filtrer les événements par date
  const eventsForDate = computed(() => (dateString: string) => {
    const start = new Date(dateString)
    start.setHours(0, 0, 0, 0)

    const end = new Date(dateString)
    end.setHours(23, 59, 59, 999)

    return events.value.filter((event) => {
      const eventDate = new Date(event.timestamp)
      return eventDate >= start && eventDate <= end
    })
  })

  // Calculer les statistiques pour une date donnée
  const statsForDate = computed(() => (dateString: string): DailyStats => {
    const dayEvents = eventsForDate.value(dateString)

    const pipiCount = dayEvents.filter((event) => event.type === 'pipi').length
    const cacaCount = dayEvents.filter((event) => event.type === 'caca').length
    const biberonEvents = dayEvents.filter((event) => event.type === 'biberon')
    const biberonCount = biberonEvents.length
    const biberonTotal = biberonEvents.reduce((sum, event) => sum + (event.quantity || 0), 0)

    return {
      date: dateString,
      pipiCount,
      cacaCount,
      biberonCount,
      biberonTotal,
    }
  })

  // Obtenir les événements des dernières 24 heures
  const recentEvents = computed(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    return events.value
      .filter((event) => new Date(event.timestamp) >= yesterday)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  })

  return {
    events,
    isLoading,
    error,
    addEvent,
    removeEvent,
    loadEvents,
    loadEventsForDate,
    eventsForDate,
    statsForDate,
    recentEvents,
  }
})
