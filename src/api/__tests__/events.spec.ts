import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import * as eventsApi from '../events'
import axios from 'axios'
import type { BabyEvent } from '@/types'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    })),
  },
}))

describe('API Events', () => {
  const mockedAxios = axios.create() as any

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should get all events', async () => {
    const mockEvents = [
      {
        id: '1',
        type: 'pipi',
        timestamp: '2023-11-15T10:30:00.000Z',
        quantity: null,
        notes: null,
      },
    ]

    mockedAxios.get.mockResolvedValue({ data: mockEvents })

    const events = await eventsApi.getAllEvents()

    expect(mockedAxios.get).toHaveBeenCalledWith('/events')
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('pipi')
    expect(events[0].timestamp).toBeInstanceOf(Date)
  })

  it('should get events by date', async () => {
    const mockEvents = [
      {
        id: '1',
        type: 'caca',
        timestamp: '2023-11-15T10:30:00.000Z',
        quantity: null,
        notes: 'Test note',
      },
    ]

    mockedAxios.get.mockResolvedValue({ data: mockEvents })

    const date = '2023-11-15'
    const events = await eventsApi.getEventsByDate(date)

    expect(mockedAxios.get).toHaveBeenCalledWith(`/events/date/${date}`)
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('caca')
    expect(events[0].notes).toBe('Test note')
  })

  it('should add an event', async () => {
    const event: BabyEvent = {
      id: '1',
      type: 'biberon',
      timestamp: new Date('2023-11-15T10:30:00.000Z'),
      quantity: 60,
      notes: 'Test biberon',
    }

    mockedAxios.post.mockResolvedValue({})

    await eventsApi.addEvent(event)

    expect(mockedAxios.post).toHaveBeenCalledWith('/events', event)
  })

  it('should update an event', async () => {
    const event: BabyEvent = {
      id: '1',
      type: 'biberon',
      timestamp: new Date('2023-11-15T10:30:00.000Z'),
      quantity: 120,
      notes: 'Test biberon modifié',
    }

    mockedAxios.put.mockResolvedValue({})

    await eventsApi.updateEvent('1', event)

    expect(mockedAxios.put).toHaveBeenCalledWith('/events/1', event)
  })

  it('should delete an event', async () => {
    mockedAxios.delete.mockResolvedValue({})

    await eventsApi.deleteEvent('1')

    expect(mockedAxios.delete).toHaveBeenCalledWith('/events/1')
  })
})
