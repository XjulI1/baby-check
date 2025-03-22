import axios from 'axios'
import type { BabyEvent, EventType } from '@/types'

const apiClient = axios.create({
  baseURL: window.env.API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Récupérer tous les événements
export async function getAllEvents(): Promise<BabyEvent[]> {
  const response = await apiClient.get('/events')
  return response.data.map(formatEventFromApi)
}

// Récupérer les événements pour une date spécifique
export async function getEventsByDate(date: string): Promise<BabyEvent[]> {
  const response = await apiClient.get(`/events/date/${date}`)
  return response.data.map(formatEventFromApi)
}

// Ajouter un nouvel événement
export async function addEvent(event: BabyEvent): Promise<void> {
  await apiClient.post('/events', event)
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
  }
}
