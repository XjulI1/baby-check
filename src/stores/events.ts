import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { BabyEvent, DailyStats, EventType } from '@/types'

export const useEventsStore = defineStore('events', () => {
  const events = ref<BabyEvent[]>([])

  // Ajouter un nouvel événement
  function addEvent(type: EventType, quantity?: number, notes?: string): void {
    const newEvent: BabyEvent = {
      id: Date.now().toString(),
      type,
      timestamp: new Date(),
      quantity,
      notes,
    }
    events.value.push(newEvent)
    saveEvents()
  }

  // Supprimer un événement
  function removeEvent(id: string): void {
    const index = events.value.findIndex((event) => event.id === id)
    if (index !== -1) {
      events.value.splice(index, 1)
      saveEvents()
    }
  }

  // Sauvegarder les événements dans le localStorage
  function saveEvents(): void {
    localStorage.setItem('babyEvents', JSON.stringify(events.value))
  }

  // Charger les événements depuis le localStorage
  function loadEvents(): void {
    const stored = localStorage.getItem('babyEvents')
    if (stored) {
      const parsedEvents = JSON.parse(stored)
      events.value = parsedEvents.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp),
      }))
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
    addEvent,
    removeEvent,
    loadEvents,
    eventsForDate,
    statsForDate,
    recentEvents,
  }
})
