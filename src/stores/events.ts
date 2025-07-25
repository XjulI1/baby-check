import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { BabyEvent, DailyStats, EventType } from '@/types'
import * as api from '@/api/events'
import { useChildStore } from './child'

export const useEventsStore = defineStore('events', () => {
  const events = ref<BabyEvent[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const childStore = useChildStore()

  // Ajouter un nouvel événement
  async function addEvent(
    type: EventType,
    quantity?: number,
    notes?: string,
    timestamp?: Date,
    breastLeft?: boolean,
    breastRight?: boolean,
    medicationName?: string,
    medicationList?: string[],
    foodItem?: string,
    foodCategory?: import('@/types').FoodCategory,
    reaction?: import('@/types').FoodReaction,
  ): Promise<void> {
    try {
      if (!childStore.currentChild) {
        error.value = 'Aucun enfant sélectionné'
        return
      }

      isLoading.value = true
      error.value = null

      const newEvent: BabyEvent = {
        id: Date.now().toString(),
        type,
        timestamp: timestamp || new Date(),
        quantity,
        notes,
        childId: childStore.currentChild.id,
        breastLeft,
        breastRight,
        medicationName,
        medicationList,
        foodItem,
        foodCategory,
        foodReaction: reaction,
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

  // Charger les événements d'une date spécifique
  async function loadEventsForDate(dateString: string): Promise<void> {
    try {
      if (!childStore.currentChild) {
        events.value = []
        return
      }

      isLoading.value = true
      error.value = null

      const data = await api.getEventsByDate(dateString, childStore.currentChild.id)

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

  // Charger les événements pour une période de jours
  async function loadEventsForPeriod(days: number): Promise<void> {
    try {
      if (!childStore.currentChild) {
        events.value = []
        return
      }

      isLoading.value = true
      error.value = null

      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const startDate = new Date(yesterday.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
      startDate.setHours(0, 0, 0, 0)

      // Formatage des dates pour l'API
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = yesterday.toISOString().split('T')[0]

      const data = await api.getEventsByDateRange(
        startDateStr,
        endDateStr,
        childStore.currentChild.id,
      )

      events.value = data
    } catch (err) {
      error.value = `Erreur lors du chargement des événements pour les derniers ${days} jours`
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

    const dodoEvents = dayEvents.filter((event) => event.type === 'dodo')
    const dodoCount = dodoEvents.length
    const dodoTotal = dodoEvents.reduce((sum, event) => sum + (event.quantity || 0), 0)

    const allaitementCount = dayEvents.filter((event) => event.type === 'allaitement').length

    const medicamentsCount = dayEvents.filter((event) => event.type === 'medicaments').length

    return {
      date: dateString,
      pipiCount,
      cacaCount,
      biberonCount,
      biberonTotal,
      dodoCount,
      dodoTotal,
      allaitementCount,
      medicamentsCount,
    }
  })

  // Obtenir les événements des dernières 24 heures
  const recentEvents = computed(() => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

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
    loadEventsForDate,
    loadEventsForPeriod,
    eventsForDate,
    statsForDate,
    recentEvents,
  }
})
