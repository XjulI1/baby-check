<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useFoodsStore } from '@/stores/foods'
import { useEventVisibility } from '@/composables/useEventVisibility'
import type { EventType, FoodCategory, FoodReaction, BabyEvent } from '@/types'

// Props pour la gestion de l'édition
const props = defineProps<{
  editingEvent?: BabyEvent | null
  isEditMode?: boolean
}>()

// Émission d'événements
const emit = defineEmits<{
  eventAdded: []
  eventUpdated: []
  cancel: []
}>()

const eventStore = useEventsStore()
const foodsStore = useFoodsStore()
const { isEventTypeVisible, visibleEventTypes } = useEventVisibility()
const selectedType = ref<EventType>('biberon')
const quantity = ref<number | undefined>(undefined)
const notes = ref('')
const submitting = ref(false)
const customTime = ref('')
const customDate = ref('')
const sleepStartDate = ref('')
const sleepStartTime = ref('')
const sleepEndDate = ref('')
const sleepEndTime = ref('')
const showSleepEnd = ref(false)
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
  { key: 'autres' as FoodCategory, label: 'Autres', icon: '🥄' },
]

const foodReactions = [
  { key: 'aime' as FoodReaction, label: 'Aime', icon: '😋' },
  { key: 'neutre' as FoodReaction, label: 'Neutre', icon: '😐' },
  { key: 'naime_pas' as FoodReaction, label: "N'aime pas", icon: '😤' },
  { key: 'allergie' as FoodReaction, label: 'Allergie', icon: '⚠️' },
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
    .filter((food) => food.category === foodCategory.value)
    .map((food) => food.name)

  // Fusionner et dédupliquer
  const allFoods = [...new Set([...categoryFoods, ...storeFoods])]

  // Filtrer selon la saisie
  return allFoods.filter((food) => food.toLowerCase().includes(searchTerm)).slice(0, 8) // Limiter à 8 suggestions
})

// Initialiser la date et l'heure actuelles
const setCurrentDateTime = () => {
  const now = new Date()

  // Format YYYY-MM-DD pour le champ date
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  customDate.value = `${year}-${month}-${day}`
  sleepStartDate.value = customDate.value
  sleepEndDate.value = customDate.value

  // Format HH:MM pour le champ heure
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  customTime.value = `${hours}:${minutes}`
  sleepStartTime.value = customTime.value
  sleepEndTime.value = customTime.value
}

// Charger les données d'un événement pour l'édition
const loadEventData = () => {
  if (!props.editingEvent) {
    setCurrentDateTime()
    return
  }

  const event = props.editingEvent
  selectedType.value = event.type
  quantity.value = event.quantity
  notes.value = event.notes || ''

  // Formatage de la date et de l'heure
  const eventDate = new Date(event.timestamp)
  const year = eventDate.getFullYear()
  const month = String(eventDate.getMonth() + 1).padStart(2, '0')
  const day = String(eventDate.getDate()).padStart(2, '0')
  customDate.value = `${year}-${month}-${day}`

  const hours = String(eventDate.getHours()).padStart(2, '0')
  const minutes = String(eventDate.getMinutes()).padStart(2, '0')
  customTime.value = `${hours}:${minutes}`

  // Champs spécifiques selon le type
  if (event.type === 'dodo') {
    if (event.sleepStartTime) {
      const startDate = new Date(event.sleepStartTime)
      const startYear = startDate.getFullYear()
      const startMonth = String(startDate.getMonth() + 1).padStart(2, '0')
      const startDay = String(startDate.getDate()).padStart(2, '0')
      sleepStartDate.value = `${startYear}-${startMonth}-${startDay}`

      const startHours = String(startDate.getHours()).padStart(2, '0')
      const startMinutes = String(startDate.getMinutes()).padStart(2, '0')
      sleepStartTime.value = `${startHours}:${startMinutes}`
    }

    if (event.sleepEndTime) {
      const endDate = new Date(event.sleepEndTime)
      const endYear = endDate.getFullYear()
      const endMonth = String(endDate.getMonth() + 1).padStart(2, '0')
      const endDay = String(endDate.getDate()).padStart(2, '0')
      sleepEndDate.value = `${endYear}-${endMonth}-${endDay}`

      const endHours = String(endDate.getHours()).padStart(2, '0')
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0')
      sleepEndTime.value = `${endHours}:${endMinutes}`

      // En mode édition, si on a une heure de fin, afficher automatiquement la section de fin
      showSleepEnd.value = true
    }
  }

  if (event.type === 'allaitement') {
    breastLeft.value = event.breastLeft || false
    breastRight.value = event.breastRight || false
  }

  if (event.type === 'medicaments') {
    medicationName.value = event.medicationName || ''
    selectedMedications.value = event.medicationList || []
  }

  if (event.type === 'aliment') {
    foodItem.value = event.foodItem || ''
    foodCategory.value = event.foodCategory || 'fruits'
    foodReaction.value = event.foodReaction || 'aime'
  }
}

// Initialiser au chargement du composant
onMounted(() => {
  loadEventData()
  // Définir le type par défaut au premier type visible si pas en mode édition
  if (!props.isEditMode && visibleEventTypes.value.length > 0) {
    selectedType.value = visibleEventTypes.value[0]
  }
})

// Watcher pour recharger les données quand l'événement change
watch(() => props.editingEvent, loadEventData)

// Watcher pour synchroniser la date de fin avec la date de début si showSleepEnd est false
watch(sleepStartDate, (newStartDate) => {
  if (!showSleepEnd.value && newStartDate && selectedType.value === 'dodo') {
    sleepEndDate.value = newStartDate
  }
})

// Watcher pour synchroniser l'heure de fin avec l'heure de début si showSleepEnd est false
watch(sleepStartTime, (newStartTime) => {
  if (!showSleepEnd.value && newStartTime && selectedType.value === 'dodo') {
    sleepEndTime.value = newStartTime
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

// Calculer la durée de sommeil en minutes à partir des dates/heures de début et fin
const calculateSleepTime = (): number => {
  if (!sleepStartDate.value || !sleepStartTime.value) {
    return 0
  }

  // Si pas de date/heure de fin, retourner 0
  if (!sleepEndDate.value || !sleepEndTime.value) {
    return 0
  }

  // Créer les objets Date pour le début et la fin
  const [startHours, startMinutes] = sleepStartTime.value.split(':').map(Number)
  const startDate = new Date(sleepStartDate.value)
  startDate.setHours(startHours, startMinutes, 0, 0)

  const [endHours, endMinutes] = sleepEndTime.value.split(':').map(Number)
  const endDate = new Date(sleepEndDate.value)
  endDate.setHours(endHours, endMinutes, 0, 0)

  // Calculer la différence en minutes
  const diffInMs = endDate.getTime() - startDate.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

  // Retourner 0 si la durée est négative (fin avant début)
  return diffInMinutes > 0 ? diffInMinutes : 0
}

// Formater la durée de sommeil pour l'affichage
const formatSleepDuration = (minutes: number): string => {
  if (minutes === 0) return '0 min'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}h ${mins > 0 ? mins + ' min' : ''}`
  }
  return `${mins} min`
}

const submitEvent = async () => {
  submitting.value = true

  // Pour les événements dodo, le timestamp est la date de fin de dodo
  // Pour les autres événements, utiliser la date/heure personnalisée
  let timestamp: Date
  if (selectedType.value === 'dodo' && sleepEndDate.value && sleepEndTime.value) {
    const [endHours, endMinutes] = sleepEndTime.value.split(':').map(Number)
    timestamp = new Date(sleepEndDate.value)
    timestamp.setHours(endHours, endMinutes, 0, 0)
  } else if (selectedType.value === 'dodo' && sleepStartDate.value && sleepStartTime.value) {
    // Si pas d'heure de fin définie, utiliser l'heure de début
    const [startHours, startMinutes] = sleepStartTime.value.split(':').map(Number)
    timestamp = new Date(sleepStartDate.value)
    timestamp.setHours(startHours, startMinutes, 0, 0)
  } else if (customDate.value && customTime.value) {
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

  // Préparer les dates de début et fin pour le sommeil
  let sleepStart: Date | undefined = undefined
  let sleepEnd: Date | undefined = undefined

  if (selectedType.value === 'dodo') {
    if (sleepStartDate.value && sleepStartTime.value) {
      const [startHours, startMinutes] = sleepStartTime.value.split(':').map(Number)
      sleepStart = new Date(sleepStartDate.value)
      sleepStart.setHours(startHours, startMinutes, 0, 0)
    }

    if (sleepEndDate.value && sleepEndTime.value) {
      const [endHours, endMinutes] = sleepEndTime.value.split(':').map(Number)
      sleepEnd = new Date(sleepEndDate.value)
      sleepEnd.setHours(endHours, endMinutes, 0, 0)
    }
  }

  try {
    if (props.isEditMode && props.editingEvent) {
      // Mode édition
      await eventStore.updateEvent(
        props.editingEvent.id,
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
        sleepStart,
        sleepEnd,
      )
      emit('eventUpdated')
    } else {
      // Mode ajout
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
        sleepStart,
        sleepEnd,
      )
      emit('eventAdded')
      resetForm()
    }
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  // Réinitialiser le formulaire seulement en mode ajout
  if (selectedType.value === 'biberon') {
    quantity.value = undefined
  } else if (selectedType.value === 'dodo') {
    sleepStartDate.value = ''
    sleepStartTime.value = ''
    sleepEndDate.value = ''
    sleepEndTime.value = ''
    showSleepEnd.value = false
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
    <h2>{{ isEditMode ? "Modifier l'événement" : 'Ajouter un événement' }}</h2>

    <div class="form-group">
      <label>Type d'événement:</label>
      <!-- Mode édition: affichage en lecture seule -->
      <div v-if="isEditMode" class="event-type-display">
        <span class="event-type-badge">
          {{ selectedType.charAt(0).toUpperCase() + selectedType.slice(1) }}
        </span>
      </div>
      <!-- Mode ajout: sélection normale -->
      <div v-else class="button-group">
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
      <div class="sleep-datetime-group">
        <div class="datetime-input">
          <label for="sleepStartDate">🛌 Début:</label>
          <div class="datetime-inputs">
            <input type="date" id="sleepStartDate" v-model="sleepStartDate" />
            <input type="time" id="sleepStartTime" v-model="sleepStartTime" />
          </div>
        </div>

        <!-- Bouton pour afficher la saisie de fin (seulement en mode ajout) -->
        <div v-if="!isEditMode && !showSleepEnd" class="sleep-end-toggle">
          <button type="button" @click="showSleepEnd = true" class="sleep-end-button">
            ⏰ Ajouter l'heure de fin
          </button>
        </div>

        <!-- Saisie de fin (affichée si showSleepEnd ou en mode édition) -->
        <div v-if="showSleepEnd || isEditMode" class="datetime-input">
          <label for="sleepEndDate">⏰ Fin:</label>
          <div class="datetime-inputs">
            <input type="date" id="sleepEndDate" v-model="sleepEndDate" />
            <input type="time" id="sleepEndTime" v-model="sleepEndTime" />
          </div>
        </div>
      </div>

      <!-- Affichage de la durée calculée -->
      <div v-if="sleepStartDate && sleepStartTime" class="sleep-duration-display">
        <span v-if="(showSleepEnd || isEditMode) && sleepEndDate && sleepEndTime">
          Durée: {{ formatSleepDuration(calculateSleepTime()) }}
        </span>
        <span v-else-if="!showSleepEnd && !isEditMode" class="duration-info">
          Ajouter une heure de fin maintenant, ou plus tard en éditant l'événement. Cela calculera
          la durée.
        </span>
        <span v-else class="duration-info"> Saisissez l'heure de fin pour calculer la durée </span>
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
      <input
        type="text"
        id="medicationName"
        v-model="medicationName"
        placeholder="Saisir le nom du médicament"
      />
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
    <div v-if="selectedType !== 'dodo'" class="form-group datetime-selection">
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

    <!-- Boutons en mode ajout -->
    <div v-if="!isEditMode" class="form-actions">
      <button
        class="submit-button"
        @click="submitEvent"
        :disabled="submitting || eventStore.isLoading"
      >
        {{ submitting ? 'Enregistrement...' : 'Ajouter' }}
      </button>
    </div>

    <!-- Boutons en mode édition -->
    <div v-else class="form-actions">
      <button class="cancel-button" @click="emit('cancel')" :disabled="submitting">Annuler</button>
      <button
        class="submit-button"
        @click="submitEvent"
        :disabled="submitting || eventStore.isLoading"
      >
        {{ submitting ? 'Modification...' : 'Modifier' }}
      </button>
    </div>

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

.cancel-button {
  background-color: var(--surface-variant-color);
  color: var(--text-primary-color);
  border: none;
  padding: 10px 16px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: var(--border-color);
}

.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.event-type-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-type-badge {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  width: fit-content;
}

.error {
  margin-top: 12px;
  color: var(--error-color);
  font-size: 14px;
}

.sleep-datetime-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.datetime-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.datetime-input label {
  font-weight: 600;
  color: var(--text-primary-color);
  font-size: 14px;
}

.datetime-inputs {
  display: flex;
  gap: 10px;
  align-items: center;
}

.datetime-inputs input[type='date'],
.datetime-inputs input[type='time'] {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--surface-color);
  color: var(--text-primary-color);
}

.datetime-inputs input[type='date'] {
  flex: 1;
}

.datetime-inputs input[type='time'] {
  flex: 1;
}

.sleep-duration-display {
  margin-top: 10px;
  padding: 10px;
  background-color: var(--surface-variant-color);
  border-radius: 4px;
  border-left: 4px solid var(--primary-color);
}

.sleep-duration-display span {
  font-weight: 600;
  color: var(--text-primary-color);
}

.duration-info {
  color: var(--text-secondary-color);
  font-style: italic;
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

.sleep-end-toggle {
  margin: 10px 0;
  text-align: center;
}

.sleep-end-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sleep-end-button:hover {
  background-color: var(--primary-hover-color);
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
