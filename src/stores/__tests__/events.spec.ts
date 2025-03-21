import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEventsStore } from '../events'
import type { BabyEvent } from '@/types'

describe('Events Store', () => {
  beforeEach(() => {
    // Créer une nouvelle instance de Pinia pour chaque test
    setActivePinia(createPinia())

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('ajoute un événement correctement', () => {
    const store = useEventsStore()
    expect(store.events.length).toBe(0)

    store.addEvent('pipi')
    expect(store.events.length).toBe(1)
    expect(store.events[0].type).toBe('pipi')

    store.addEvent('caca', undefined, 'Test notes')
    expect(store.events.length).toBe(2)
    expect(store.events[1].type).toBe('caca')
    expect(store.events[1].notes).toBe('Test notes')

    store.addEvent('biberon', 60)
    expect(store.events.length).toBe(3)
    expect(store.events[2].type).toBe('biberon')
    expect(store.events[2].quantity).toBe(60)
  })

  it('supprime un événement correctement', () => {
    const store = useEventsStore()
    store.addEvent('pipi')
    const id = store.events[0].id

    expect(store.events.length).toBe(1)
    store.removeEvent(id)
    expect(store.events.length).toBe(0)
  })

  it('filtre les événements par date', () => {
    const store = useEventsStore()

    // Créer des dates spécifiques
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(12, 0, 0, 0)

    const today = new Date()
    today.setHours(12, 0, 0, 0)

    // Ajouter des événements avec des dates spécifiques
    store.events = [
      {
        id: '1',
        type: 'pipi',
        timestamp: yesterday,
      },
      {
        id: '2',
        type: 'caca',
        timestamp: today,
      },
    ] as BabyEvent[]

    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]

    // Vérifier le filtrage
    expect(store.eventsForDate(yesterdayStr).length).toBe(1)
    expect(store.eventsForDate(yesterdayStr)[0].id).toBe('1')

    expect(store.eventsForDate(todayStr).length).toBe(1)
    expect(store.eventsForDate(todayStr)[0].id).toBe('2')
  })

  it('calcule correctement les statistiques quotidiennes', () => {
    const store = useEventsStore()
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Ajouter des événements pour aujourd'hui
    store.events = [
      {
        id: '1',
        type: 'pipi',
        timestamp: today,
      },
      {
        id: '2',
        type: 'pipi',
        timestamp: today,
      },
      {
        id: '3',
        type: 'caca',
        timestamp: today,
      },
      {
        id: '4',
        type: 'biberon',
        timestamp: today,
        quantity: 50,
      },
      {
        id: '5',
        type: 'biberon',
        timestamp: today,
        quantity: 70,
      },
    ] as BabyEvent[]

    const stats = store.statsForDate(todayStr)
    expect(stats.pipiCount).toBe(2)
    expect(stats.cacaCount).toBe(1)
    expect(stats.biberonCount).toBe(2)
    expect(stats.biberonTotal).toBe(120)
  })

  it('sauvegarde les événements dans localStorage', () => {
    const store = useEventsStore()
    store.addEvent('pipi')

    expect(localStorage.setItem).toHaveBeenCalled()
    const lastCall = vi.mocked(localStorage.setItem).mock.calls[0]
    expect(lastCall[0]).toBe('babyEvents')
    expect(JSON.parse(lastCall[1])[0].type).toBe('pipi')
  })

  it('charge les événements depuis localStorage', () => {
    const today = new Date()
    const mockEvents = JSON.stringify([
      {
        id: '1',
        type: 'pipi',
        timestamp: today.toISOString(),
      },
    ])

    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(mockEvents)

    const store = useEventsStore()
    store.loadEvents()

    expect(store.events.length).toBe(1)
    expect(store.events[0].type).toBe('pipi')
    // Vérifier que la date est convertie correctement
    expect(store.events[0].timestamp).toBeInstanceOf(Date)
  })

  it('renvoie les événements récents', () => {
    const store = useEventsStore()
    const today = new Date()
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    // Ajouter des événements
    store.events = [
      {
        id: '1',
        type: 'pipi',
        timestamp: today,
      },
      {
        id: '2',
        type: 'caca',
        timestamp: twoDaysAgo,
      },
    ] as BabyEvent[]

    const recentEvents = store.recentEvents
    expect(recentEvents.length).toBe(1)
    expect(recentEvents[0].id).toBe('1')
  })
})
