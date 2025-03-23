import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Child } from '@/types'

export const useChildStore = defineStore('child', () => {
  const children = ref<Child[]>([])
  const currentChildId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Charger les enfants et l'enfant actuel depuis le localStorage
  function loadFromLocalStorage() {
    try {
      // Charger la liste des enfants
      const storedChildren = localStorage.getItem('children')
      if (storedChildren) {
        children.value = JSON.parse(storedChildren)
      }

      // Charger l'enfant actuel
      const storedCurrentChildId = localStorage.getItem('currentChildId')
      if (storedCurrentChildId) {
        currentChildId.value = storedCurrentChildId
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données d'enfants:", err)
    }
  }

  // Sauvegarder les enfants et l'enfant actuel dans le localStorage
  function saveToLocalStorage() {
    try {
      localStorage.setItem('children', JSON.stringify(children.value))
      if (currentChildId.value) {
        localStorage.setItem('currentChildId', currentChildId.value)
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement des données d'enfants:", err)
    }
  }

  // Générer un ID d'enfant à partir du prénom et du nom
  function generateChildId(firstName: string, lastName: string): string {
    // Normaliser les entrées : mettre en minuscules et supprimer les espaces/caractères spéciaux
    const normalizedFirstName = firstName
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    const normalizedLastName = lastName
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    return `${normalizedFirstName}-${normalizedLastName}`
  }

  // Vérifier si un enfant avec le même ID existe déjà
  function childExists(id: string): boolean {
    return children.value.some((child) => child.id === id)
  }

  // Ajouter un nouvel enfant
  function addChild(firstName: string, lastName: string): Child {
    // Générer un ID unique basé sur le prénom et la première lettre du nom
    const baseId = generateChildId(firstName, lastName)

    // Vérifier si un enfant avec cet ID existe déjà
    // Si oui, c'est le même enfant, donc on le retourne directement
    const existingChild = children.value.find((child) => child.id === baseId)
    if (existingChild) {
      return existingChild
    }

    // Si l'ID est déjà utilisé mais avec des attributs différents (cas rare mais possible),
    // nous pouvons ajouter un index pour le rendre unique
    let id = baseId
    let counter = 1

    while (childExists(id)) {
      id = `${baseId}-${counter}`
      counter++
    }

    const newChild: Child = {
      id,
      firstName,
      lastName: lastName.charAt(0).toUpperCase(), // Juste la première lettre en majuscule
    }

    children.value.push(newChild)
    saveToLocalStorage()
    return newChild
  }

  // Sélectionner l'enfant actuel
  function selectChild(childId: string) {
    const child = children.value.find((c) => c.id === childId)
    if (child) {
      currentChildId.value = childId
      saveToLocalStorage()
      return true
    }
    return false
  }

  // Supprimer un enfant
  function removeChild(childId: string) {
    const index = children.value.findIndex((c) => c.id === childId)
    if (index !== -1) {
      children.value.splice(index, 1)

      // Si c'était l'enfant actuel, réinitialiser
      if (currentChildId.value === childId) {
        currentChildId.value = children.value.length > 0 ? children.value[0].id : null
      }

      saveToLocalStorage()
      return true
    }
    return false
  }

  // Obtenir l'enfant actuel
  const currentChild = computed(() => {
    if (!currentChildId.value) return null
    return children.value.find((c) => c.id === currentChildId.value) || null
  })

  // Initialiser le store au démarrage
  loadFromLocalStorage()

  return {
    children,
    currentChildId,
    currentChild,
    isLoading,
    error,
    addChild,
    selectChild,
    removeChild,
    loadFromLocalStorage,
    generateChildId, // Exposer cette fonction pour d'autres usages
  }
})
