import { describe, it, expect, beforeEach } from 'vitest'
import { useEventVisibility } from '@/composables/useEventVisibility'
import type { EventType, BabyEvent } from '@/types'

// Mock localStorage
const localStorageMock = {
  getItem: (key: string): string | null => {
    return localStorageMock.store[key] || null
  },
  setItem: (key: string, value: string): void => {
    localStorageMock.store[key] = value
  },
  removeItem: (key: string): void => {
    delete localStorageMock.store[key]
  },
  store: {} as Record<string, string>,
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useEventVisibility', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.store = {}
  })

  it('should show all event types by default', () => {
    const { isEventTypeVisible, visibleEventTypes } = useEventVisibility()

    expect(isEventTypeVisible('pipi')).toBe(true)
    expect(isEventTypeVisible('caca')).toBe(true)
    expect(isEventTypeVisible('biberon')).toBe(true)
    expect(isEventTypeVisible('dodo')).toBe(true)
    expect(isEventTypeVisible('allaitement')).toBe(true)
    expect(isEventTypeVisible('medicaments')).toBe(true)

    expect(visibleEventTypes.value).toEqual(['biberon', 'allaitement', 'pipi', 'caca', 'dodo', 'medicaments'])
  })

  it('should filter events correctly', () => {
    // Set up localStorage with hidden events
    localStorage.setItem('baby-check-hidden-events', JSON.stringify(['pipi', 'caca']))

    const { filterVisibleEvents, isEventTypeVisible, refreshSettings } = useEventVisibility()

    // Refresh settings to load the new localStorage data
    refreshSettings()

    expect(isEventTypeVisible('pipi')).toBe(false)
    expect(isEventTypeVisible('caca')).toBe(false)
    expect(isEventTypeVisible('biberon')).toBe(true)

    const mockEvents: BabyEvent[] = [
      {
        id: '1',
        type: 'pipi',
        timestamp: new Date(),
        childId: 'child1',
      },
      {
        id: '2',
        type: 'biberon',
        timestamp: new Date(),
        quantity: 150,
        childId: 'child1',
      },
      {
        id: '3',
        type: 'caca',
        timestamp: new Date(),
        childId: 'child1',
      },
    ]

    const filteredEvents = filterVisibleEvents(mockEvents)

    expect(filteredEvents).toHaveLength(1)
    expect(filteredEvents[0].type).toBe('biberon')
  })

  it('should return correct visible event types when some are hidden', () => {
    localStorage.setItem('baby-check-hidden-events', JSON.stringify(['dodo', 'allaitement']))

    const { visibleEventTypes, hiddenEventTypes, refreshSettings } = useEventVisibility()

    // Refresh settings to load the new localStorage data
    refreshSettings()

    expect(visibleEventTypes.value).toEqual(['biberon', 'pipi', 'caca', 'medicaments'])
    expect(hiddenEventTypes.value).toEqual(['dodo', 'allaitement'])
  })

  it('should handle invalid localStorage data gracefully', () => {
    localStorage.setItem('baby-check-hidden-events', 'invalid json')

    const { isEventTypeVisible } = useEventVisibility()

    // Should default to showing all events when localStorage data is invalid
    expect(isEventTypeVisible('pipi')).toBe(true)
    expect(isEventTypeVisible('caca')).toBe(true)
  })
})
