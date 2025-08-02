import axios from 'axios'
import type { BabyEvent, EventType } from '@/types'

const apiClient = axios.create({
  baseURL: window.env.API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Récupérer tous les événements d'un enfant
export async function getAllEvents(childId?: string): Promise<BabyEvent[]> {
  const response = await apiClient.get(childId ? `/events?childId=${childId}` : '/events')
  return response.data.map(formatEventFromApi)
}

// Récupérer les événements pour une date spécifique
export async function getEventsByDate(date: string, childId?: string): Promise<BabyEvent[]> {
  const url = childId ? `/events/date/${date}?childId=${childId}` : `/events/date/${date}`
  const response = await apiClient.get(url)
  return response.data.map(formatEventFromApi)
}

// Récupérer les événements pour une plage de dates
export async function getEventsByDateRange(
  startDate: string,
  endDate: string,
  childId?: string,
): Promise<BabyEvent[]> {
  const url = childId
    ? `/events/range/${startDate}/${endDate}?childId=${childId}`
    : `/events/range/${startDate}/${endDate}`
  const response = await apiClient.get(url)
  return response.data.map(formatEventFromApi)
}

// Ajouter un nouvel événement
export async function addEvent(event: BabyEvent): Promise<void> {
  await apiClient.post('/events', event)
}

// Modifier un événement existant
export async function updateEvent(id: string, event: BabyEvent): Promise<void> {
  await apiClient.put(`/events/${id}`, event)
}

// Supprimer un événement
export async function deleteEvent(id: string): Promise<void> {
  await apiClient.delete(`/events/${id}`)
}

// Formater un événement depuis l'API
function formatEventFromApi(apiEvent: any): BabyEvent {
  return {
    id: apiEvent.id,
    type: apiEvent.type as EventType,
    timestamp: new Date(apiEvent.timestamp),
    quantity: apiEvent.quantity !== undefined ? Number(apiEvent.quantity) : undefined,
    notes: apiEvent.notes,
    childId: apiEvent.childId,
    breastLeft: apiEvent.breastLeft,
    breastRight: apiEvent.breastRight,
    medicationName: apiEvent.medicationName,
    medicationList: apiEvent.medicationList,
    foodItem: apiEvent.foodItem,
    foodCategory: apiEvent.foodCategory,
    foodReaction: apiEvent.foodReaction,
    sleepStartTime: apiEvent.sleepStartTime ? new Date(apiEvent.sleepStartTime) : undefined,
    sleepEndTime: apiEvent.sleepEndTime ? new Date(apiEvent.sleepEndTime) : undefined,
  }
}
