<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useFoodsStore } from '@/stores/foods'
import { useEventVisibility } from '@/composables/useEventVisibility'
import type { EventType, FoodCategory, FoodReaction } from '@/types'

const eventStore = useEventsStore()
const foodsStore = useFoodsStore()
const { isEventTypeVisible, visibleEventTypes } = useEventVisibility()
const selectedType = ref<EventType>('biberon')
const quantity = ref<number | undefined>(undefined)
const notes = ref('')
const submitting = ref(false)
const customTime = ref('')
const customDate = ref('')
const sleepHours = ref<number>(0)
const sleepMinutes = ref<number>(0)
// Ajout pour l'allaitement
const breastLeft = ref(false)
const breastRight = ref(false)

// Ajout pour les médicaments
const medicationName = ref('')
const selectedMedications = ref<string[]>([])

// Ajout pour les aliments
const foodItem = ref('')
const foodCategory = ref<FoodCategory>('fruits')
const foodReaction = ref<FoodReaction>('aime')
const showSuggestions = ref(false)
const foodInputRef = ref<HTMLInputElement>()

// Liste prédéfinie de médicaments courants
const commonMedications = [
  'Probiotiques',
  'Vitamine D',
  'Doliprane',
  'Antibiotiques',
  'Homéopathie',
]

// Catégories et réactions alimentaires
const foodCategories = [
  { key: 'fruits' as FoodCategory, label: 'Fruits', icon: '🍎' },
  { key: 'legumes' as FoodCategory, label: 'Légumes', icon: '🥕' },
  { key: 'viandes' as FoodCategory, label: 'Viandes', icon: '🥩' },
  { key: 'poissons' as FoodCategory, label: 'Poissons', icon: '🐟' },
  { key: 'cereales' as FoodCategory, label: 'Céréales', icon: '🌾' },
  { key: 'laitiers' as FoodCategory, label: 'Laitiers', icon: '🥛' },
  { key: 'autres' as FoodCategory, label: 'Autres', icon: '🥄' }
]

const foodReactions = [
  { key: 'aime' as FoodReaction, label: 'Aime', icon: '😋' },
  { key: 'neutre' as FoodReaction, label: 'Neutre', icon: '😐' },
  { key: 'naime_pas' as FoodReaction, label: "N'aime pas", icon: '😤' },
  { key: 'allergie' as FoodReaction, label: 'Allergie', icon: '⚠️' }
]

// Computed pour les suggestions d'aliments
const filteredSuggestions = computed(() => {
  if (!foodItem.value || foodItem.value.length < 1) {
    return []
  }

  const searchTerm = foodItem.value.toLowerCase()

  // Combiner les aliments prédéfinis de la catégorie et les aliments du store
  const categoryFoods = foodsStore.predefinedFoods[foodCategory.value] || []
  const storeFoods = foodsStore.discoveredFoods
    .filter(food => food.category === foodCategory.value)
    .map(food => food.name)

  // Fusionner et dédupliquer
  const allFoods = [...new Set([...categoryFoods, ...storeFoods])]

  // Filtrer selon la saisie
  return allFoods
    .filter(food => food.toLowerCase().includes(searchTerm))
    .slice(0, 8) // Limiter à 8 suggestions
})

// Initialiser la date et l'heure actuelles
const setCurrentDateTime = () => {
  const now = new Date()

  // Format YYYY-MM-DD pour le champ date
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  customDate.value = `${year}-${month}-${day}`

  // Format HH:MM pour le champ heure
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  customTime.value = `${hours}:${minutes}`
}

// Initialiser au chargement du composant
onMounted(() => {
  setCurrentDateTime()
  // Définir le type par défaut au premier type visible
  if (visibleEventTypes.value.length > 0) {
    selectedType.value = visibleEventTypes.value[0]
  }
})

// Watcher pour charger les aliments quand on sélectionne le type "aliment"
watch(selectedType, async (newType) => {
  if (newType === 'aliment') {
    // Utiliser un childId par défaut si disponible ou essayer de le récupérer
    const childId = localStorage.getItem('currentChildId') || 'default'
    try {
      await foodsStore.loadFoods(childId)
    } catch (error) {
      console.warn('Impossible de charger les aliments:', error)
    }
  }
})

// Méthodes pour l'auto-complétion
const selectSuggestion = (suggestion: string) => {
  foodItem.value = suggestion
  showSuggestions.value = false
}

const handleFoodInput = () => {
  showSuggestions.value = foodItem.value.length > 0 && filteredSuggestions.value.length > 0
}

const handleFoodFocus = () => {
  if (foodItem.value && filteredSuggestions.value.length > 0) {
    showSuggestions.value = true
  }
}

const handleFoodBlur = () => {
  // Délai pour permettre le clic sur les suggestions
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// Calculer la quantité totale en minutes pour le sommeil
const calculateSleepTime = (): number => {
  return sleepHours.value * 60 + sleepMinutes.value
}

const addEvent = async () => {
  submitting.value = true

  // Créer une date combinant la date et l'heure personnalisées
  let timestamp: Date
  if (customDate.value && customTime.value) {
    const [hours, minutes] = customTime.value.split(':').map(Number)
    timestamp = new Date(customDate.value)
    timestamp.setHours(hours, minutes, 0, 0)
  } else {
    // Utiliser la date et l'heure actuelles si aucune n'est spécifiée
    timestamp = new Date()
  }

  // Calculer la quantité selon le type d'événement
  let eventQuantity: number | undefined = undefined

  if (selectedType.value === 'biberon') {
    eventQuantity = quantity.value
  } else if (selectedType.value === 'dodo') {
    eventQuantity = calculateSleepTime()
  }

  await eventStore.addEvent(
    selectedType.value,
    eventQuantity,
    notes.value,
    timestamp,
    selectedType.value === 'allaitement' ? breastLeft.value : undefined,
    selectedType.value === 'allaitement' ? breastRight.value : undefined,
    selectedType.value === 'medicaments' ? medicationName.value : undefined,
    selectedType.value === 'medicaments' ? selectedMedications.value : undefined,
    selectedType.value === 'aliment' ? foodItem.value : undefined,
    selectedType.value === 'aliment' ? foodCategory.value : undefined,
    selectedType.value === 'aliment' ? foodReaction.value : undefined,
  )
  submitting.value = false

  // Réinitialiser le formulaire
  if (selectedType.value === 'biberon') {
    quantity.value = undefined
  } else if (selectedType.value === 'dodo') {
    sleepHours.value = 0
    sleepMinutes.value = 0
  } else if (selectedType.value === 'allaitement') {
    breastLeft.value = false
    breastRight.value = false
  } else if (selectedType.value === 'medicaments') {
    medicationName.value = ''
    selectedMedications.value = []
  } else if (selectedType.value === 'aliment') {
    foodItem.value = ''
    foodCategory.value = 'fruits'
    foodReaction.value = 'aime'
  }
  notes.value = ''

  // Remettre la date et l'heure à jour
  setCurrentDateTime()
}
</script>

<template>
  <div class="event-form">
    <h2>Ajouter un événement</h2>

    <div class="form-group">
      <label>Type d'événement:</label>
      <div class="button-group">
        <button
          v-if="isEventTypeVisible('biberon')"
          @click="selectedType = 'biberon'"
          :class="{ active: selectedType === 'biberon' }"
        >
          Biberon
        </button>
        <button
          v-if="isEventTypeVisible('allaitement')"
          @click="selectedType = 'allaitement'"
          :class="{ active: selectedType === 'allaitement' }"
        >
          Allaitement
        </button>
        <button
          v-if="isEventTypeVisible('pipi')"
          @click="selectedType = 'pipi'"
          :class="{ active: selectedType === 'pipi' }"
        >
          Pipi
        </button>
        <button
          v-if="isEventTypeVisible('caca')"
          @click="selectedType = 'caca'"
          :class="{ active: selectedType === 'caca' }"
        >
          Caca
        </button>
        <button
          v-if="isEventTypeVisible('dodo')"
          @click="selectedType = 'dodo'"
          :class="{ active: selectedType === 'dodo' }"
        >
          Dodo
        </button>
        <button
          v-if="isEventTypeVisible('medicaments')"
          @click="selectedType = 'medicaments'"
          :class="{ active: selectedType === 'medicaments' }"
        >
          Médicaments
        </button>
        <button
          v-if="isEventTypeVisible('aliment')"
          @click="selectedType = 'aliment'"
          :class="{ active: selectedType === 'aliment' }"
        >
          Aliment
        </button>
      </div>
    </div>

    <div v-if="selectedType === 'biberon'" class="form-group">
      <label for="quantity">Quantité (ml):</label>
      <input type="number" id="quantity" v-model="quantity" min="0" step="5" />
    </div>

    <div v-if="selectedType === 'dodo'" class="form-group">
      <label for="sleepTime">Durée du sommeil:</label>
      <div class="sleep-time-inputs">
        <div class="time-input-group">
          <input type="number" id="sleepHours" v-model="sleepHours" min="0" max="24" />
          <span>heures</span>
        </div>
        <div class="time-input-group">
          <input type="number" id="sleepMinutes" v-model="sleepMinutes" min="0" max="59" step="5" />
          <span>minutes</span>
        </div>
      </div>
    </div>

    <div v-if="selectedType === 'allaitement'" class="form-group">
      <label>Sein utilisé:</label>
      <div class="checkbox-group">
        <div class="checkbox-item">
          <input type="checkbox" id="breastLeft" v-model="breastLeft" />
          <label for="breastLeft">Sein gauche</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="breastRight" v-model="breastRight" />
          <label for="breastRight">Sein droit</label>
        </div>
      </div>
    </div>

    <div v-if="selectedType === 'medicaments'" class="form-group">
      <label for="medicationName">Nom du médicament (saisie libre):</label>
      <input type="text" id="medicationName" v-model="medicationName" placeholder="Saisir le nom du médicament" />
    </div>

    <div v-if="selectedType === 'medicaments'" class="form-group">
      <label>Médicaments courants:</label>
      <div class="checkbox-group">
        <div v-for="medication in commonMedications" :key="medication" class="checkbox-item">
          <input
            type="checkbox"
            :id="'med-' + medication"
            :value="medication"
            v-model="selectedMedications"
          />
          <label :for="'med-' + medication">{{ medication }}</label>
        </div>
      </div>
    </div>

    <div v-if="selectedType === 'aliment'" class="form-group">
      <label>Catégorie:</label>
      <div class="button-group">
        <button
          v-for="category in foodCategories"
          :key="category.key"
          @click="foodCategory = category.key"
          :class="{ active: foodCategory === category.key }"
          class="category-btn"
        >
          {{ category.icon }} {{ category.label }}
        </button>
      </div>
    </div>

    <div v-if="selectedType === 'aliment'" class="form-group">
      <label for="foodItem">Nom de l'aliment:</label>
      <div class="autocomplete-container">
        <input
          type="text"
          id="foodItem"
          ref="foodInputRef"
          v-model="foodItem"
          placeholder="Ex: Carotte, Pomme, Poisson..."
          @input="handleFoodInput"
          @focus="handleFoodFocus"
          @blur="handleFoodBlur"
        />
        <div v-if="showSuggestions && filteredSuggestions.length > 0" class="suggestions-list">
          <div
            v-for="suggestion in filteredSuggestions"
            :key="suggestion"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedType === 'aliment'" class="form-group">
      <label>Réaction:</label>
      <div class="button-group">
        <button
          v-for="reaction in foodReactions"
          :key="reaction.key"
          @click="foodReaction = reaction.key"
          :class="{ active: foodReaction === reaction.key }"
          class="reaction-btn"
        >
          {{ reaction.icon }} {{ reaction.label }}
        </button>
      </div>
    </div>

    <!-- Champs de sélection de date et heure -->
    <div class="form-group datetime-selection">
      <label>Date et heure:</label>
      <div class="datetime-inputs">
        <div class="date-input">
          <input type="date" id="customDate" v-model="customDate" />
        </div>
        <div class="time-input">
          <input type="time" id="customTime" v-model="customTime" />
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="notes">Notes:</label>
      <textarea id="notes" v-model="notes" rows="2"></textarea>
    </div>

    <button class="submit-button" @click="addEvent" :disabled="submitting || eventStore.isLoading">
      {{ submitting ? 'Enregistrement...' : 'Ajouter' }}
    </button>

    <!-- Affichage des erreurs -->
    <div v-if="eventStore.error" class="error">
      {{ eventStore.error }}
    </div>
  </div>
</template>

<style scoped>
.event-form {
  background-color: var(--surface-variant-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  color: var(--text-primary-color);
}

.button-group {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

button {
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--surface-color);
  color: var(--text-primary-color);
  cursor: pointer;
}

button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-hover-color);
}

input,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--surface-color);
  color: var(--text-primary-color);
}

.datetime-selection {
  display: flex;
  flex-direction: column;
}

.datetime-inputs {
  display: flex;
  gap: 10px;
}

.date-input,
.time-input {
  flex: 1;
}

.date-input input[type='date'],
.time-input input[type='time'] {
  width: 100%;
}

.submit-button {
  background-color: var(--secondary-color);
  color: white;
  border: none;
  padding: 10px 16px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: var(--secondary-hover-color);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  margin-top: 12px;
  color: var(--error-color);
  font-size: 14px;
}

.sleep-time-inputs {
  display: flex;
  gap: 15px;
  align-items: center;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.time-input-group input {
  width: 60px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  text-align: center;
  background-color: var(--surface-color);
  color: var(--text-primary-color);
}

.checkbox-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item input[type='checkbox'] {
  width: auto;
  margin: 0;
}

.checkbox-item label {
  margin: 0;
  font-weight: normal;
  cursor: pointer;
}

.category-btn,
.reaction-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--surface-color);
  color: var(--text-primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-btn.active,
.reaction-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-hover-color);
}

/* Styles pour l'auto-complétion */
.autocomplete-container {
  position: relative;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  color: var(--text-primary-color);
  border-bottom: 1px solid var(--border-color);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: var(--surface-variant-color);
}
</style>
