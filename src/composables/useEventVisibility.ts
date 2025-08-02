import { ref, computed } from 'vue'
import type { EventType, BabyEvent } from '@/types'

const STORAGE_KEY = 'baby-check-hidden-events'

// État global partagé
const hiddenEvents = ref<Set<EventType>>(new Set())

// Charger les paramètres depuis le localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const hiddenEventsList = JSON.parse(saved) as EventType[]
      hiddenEvents.value = new Set(hiddenEventsList)
    } else {
      hiddenEvents.value = new Set()
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres de visibilité:', error)
    hiddenEvents.value = new Set()
  }
}

// Initialiser les paramètres au chargement du module
loadSettings()

export function useEventVisibility() {
  // Recharger les paramètres (pour les changements dans d'autres onglets ou tests)
  const refreshSettings = () => {
    loadSettings()
  }

  // Vérifier si un type d'événement est visible
  const isEventTypeVisible = (eventType: EventType): boolean => {
    return !hiddenEvents.value.has(eventType)
  }

  // Filtrer une liste d'événements pour ne garder que les visibles
  const filterVisibleEvents = (events: BabyEvent[]): BabyEvent[] => {
    return events.filter((event) => isEventTypeVisible(event.type))
  }

  // Obtenir la liste des types d'événements visibles
  const visibleEventTypes = computed(() => {
    const allTypes: EventType[] = [
      'biberon',
      'allaitement',
      'pipi',
      'caca',
      'dodo',
      'medicaments',
      'aliment',
    ]
    return allTypes.filter((type) => isEventTypeVisible(type))
  })

  // Obtenir la liste des types d'événements masqués
  const hiddenEventTypes = computed(() => {
    return Array.from(hiddenEvents.value)
  })

  return {
    isEventTypeVisible,
    filterVisibleEvents,
    visibleEventTypes,
    hiddenEventTypes,
    refreshSettings,
  }
}
