import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DiscoveredFood, FoodCategory, FoodReaction } from '@/types'
import * as api from '@/api/foods'

export const useFoodsStore = defineStore('foods', () => {
  const discoveredFoods = ref<DiscoveredFood[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Aliments prédéfinis par catégorie
  const predefinedFoods = {
    fruits: [
      'Pomme', 'Poire', 'Banane', 'Pêche', 'Abricot', 'Prune', 'Avocat',
      'Orange', 'Mandarine', 'Kiwi', 'Fraise', 'Framboise', 'Myrtille',
      'Raisin', 'Melon', 'Pastèque', 'Mangue', 'Ananas'
    ],
    legumes: [
      'Carotte', 'Courgette', 'Haricots verts', 'Petits pois', 'Brocoli',
      'Chou-fleur', 'Épinard', 'Courge', 'Potiron', 'Patate douce',
      'Pomme de terre', 'Betterave', 'Panais', 'Navet', 'Artichaut',
      'Aubergine', 'Tomate', 'Concombre', 'Poivron'
    ],
    viandes: [
      'Porc', 'Bœuf', 'Veau', 'Agneau', 'Poulet', 'Dinde', 'Canard',
      'Lapin', 'Jambon', 'Boudin noir'
    ],
    poissons: [
      'Sole', 'Cabillaud', 'Saumon', 'Truite', 'Sardine', 'Maquereau',
      'Thon', 'Lieu', 'Colin', 'Dorade', 'Bar', 'Merlan'
    ],
    cereales: [
      'Riz', 'Avoine', 'Blé', 'Orge', 'Millet', 'Quinoa', 'Sarrasin',
      'Pâtes', 'Pain', 'Semoule', 'Polenta'
    ],
    laitiers: [
      'Yaourt nature', 'Fromage blanc', 'Petit-suisse', 'Gruyère',
      'Emmental', 'Camembert', 'Chèvre', 'Brebis', 'Lait de vache'
    ],
    autres: [
      'Œuf', 'Huile d\'olive', 'Beurre', 'Légumineuses',
      'Lentilles', 'Pois chiches', 'Haricots blancs'
    ]
  }

  // Getters
  const getFoodsByCategory = computed(() => {
    return (category: FoodCategory) => {
      return discoveredFoods.value.filter(food => food.category === category)
    }
  })

  const getFoodsByChild = computed(() => {
    return (childId: string) => {
      return discoveredFoods.value.filter(food => food.child_id === childId)
    }
  })

  const getFoodsByChildAndCategory = computed(() => {
    return (childId: string, category: FoodCategory) => {
      return discoveredFoods.value.filter(
        food => food.child_id === childId && food.category === category
      )
    }
  })

  const getDiscoveredFoodByName = computed(() => {
    return (name: string, childId: string) => {
      return discoveredFoods.value.find(
        food => food.name === name && food.child_id === childId
      )
    }
  })

  const getStatsForChild = computed(() => {
    return (childId: string) => {
      const childFoods = discoveredFoods.value.filter(food => food.child_id === childId)

      const stats = {
        total: childFoods.length,
        byCategory: {} as Record<FoodCategory, number>,
        byReaction: {
          aime: 0,
          neutre: 0,
          naime_pas: 0,
          allergie: 0
        }
      }

      // Initialiser les catégories
      Object.keys(predefinedFoods).forEach(category => {
        stats.byCategory[category as FoodCategory] = 0
      })

      // Compter par catégorie et réaction
      childFoods.forEach(food => {
        stats.byCategory[food.category]++
        stats.byReaction[food.last_reaction]++
      })

      return stats
    }
  })  // Actions
  const loadFoods = async (childId: string) => {
    try {
      isLoading.value = true
      error.value = null
      const foods = await api.getFoods(childId)
      discoveredFoods.value = foods
    } catch (err) {
      error.value = 'Erreur lors du chargement des aliments'
      console.error('Erreur lors du chargement des aliments:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addOrUpdateFood = async (
    name: string,
    category: FoodCategory,
    reaction: FoodReaction,
    childId: string,
    date: Date = new Date()
  ) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.addOrUpdateFood(name, category, reaction, childId, date)

      // Mettre à jour le store local
      const existingIndex = discoveredFoods.value.findIndex(
        food => food.name === name && food.child_id === childId
      )

      if (existingIndex !== -1) {
        discoveredFoods.value[existingIndex] = response.food
      } else {
        discoveredFoods.value.push(response.food)
      }

      return response.food
    } catch (err) {
      error.value = 'Erreur lors de l\'ajout/mise à jour de l\'aliment'
      console.error('Erreur lors de l\'ajout/mise à jour de l\'aliment:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeFood = async (name: string, childId: string) => {
    try {
      isLoading.value = true
      error.value = null

      await api.removeFood(name, childId)

      // Mettre à jour le store local
      const index = discoveredFoods.value.findIndex(
        food => food.name === name && food.child_id === childId
      )
      if (index !== -1) {
        discoveredFoods.value.splice(index, 1)
      }
    } catch (err) {
      error.value = 'Erreur lors de la suppression de l\'aliment'
      console.error('Erreur lors de la suppression de l\'aliment:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getStats = async (childId: string) => {
    try {
      return await api.getFoodStats(childId)
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err)
      // Fallback: calcul local
      return getStatsForChild.value(childId)
    }
  }

  const getPredefinedFoodsByCategory = (category: FoodCategory) => {
    return predefinedFoods[category] || []
  }

  return {
    discoveredFoods,
    predefinedFoods,
    isLoading,
    error,
    getFoodsByCategory,
    getFoodsByChild,
    getFoodsByChildAndCategory,
    getDiscoveredFoodByName,
    getStatsForChild,
    loadFoods,
    addOrUpdateFood,
    removeFood,
    getStats,
    getPredefinedFoodsByCategory
  }
})
