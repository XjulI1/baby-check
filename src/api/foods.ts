import axios from 'axios'
import type { DiscoveredFood, FoodCategory, FoodReaction } from '@/types'

const apiClient = axios.create({
  baseURL: window.env?.API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interface pour les statistiques d'aliments
export interface FoodStats {
  total: number
  byCategory: Record<FoodCategory, number>
  byReaction: Record<FoodReaction, number>
}

// Interface pour la réponse d'ajout/mise à jour d'aliment
export interface FoodResponse {
  message: string
  food: DiscoveredFood
}

/**
 * Récupérer tous les aliments découverts pour un enfant
 */
export async function getFoods(childId: string): Promise<DiscoveredFood[]> {
  try {
    const response = await apiClient.get(`/foods/${childId}`)
    return response.data.map((food: any) => ({
      ...food,
      first_tasted_date: new Date(food.first_tasted_date),
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des aliments:', error)
    throw error
  }
}

/**
 * Ajouter ou mettre à jour un aliment découvert
 */
export async function addOrUpdateFood(
  name: string,
  category: FoodCategory,
  reaction: FoodReaction,
  childId: string,
  date?: Date,
): Promise<FoodResponse> {
  try {
    const response = await apiClient.post('/foods', {
      name,
      category,
      reaction,
      childId,
      date: date?.toISOString(),
    })

    return {
      message: response.data.message,
      food: {
        ...response.data.food,
        first_tasted_date: new Date(response.data.food.first_tasted_date),
      },
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout/mise à jour de l'aliment:", error)
    throw error
  }
}

/**
 * Supprimer un aliment découvert
 */
export async function removeFood(name: string, childId: string): Promise<void> {
  try {
    await apiClient.delete(`/foods/${childId}/${encodeURIComponent(name)}`)
  } catch (error) {
    console.error("Erreur lors de la suppression de l'aliment:", error)
    throw error
  }
}

/**
 * Récupérer les statistiques des aliments pour un enfant
 */
export async function getFoodStats(childId: string): Promise<FoodStats> {
  try {
    const response = await apiClient.get(`/foods/${childId}/stats`)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    throw error
  }
}
