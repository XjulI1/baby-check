<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '@/stores/events'
import type { EventType } from '@/types'

const eventStore = useEventsStore()
const selectedType = ref<EventType>('pipi')
const quantity = ref<number | undefined>(undefined)
const notes = ref('')
const submitting = ref(false)
const customTime = ref('')
const customDate = ref('')
const sleepHours = ref<number>(0)
const sleepMinutes = ref<number>(0)

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
})

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

  await eventStore.addEvent(selectedType.value, eventQuantity, notes.value, timestamp)
  submitting.value = false

  // Réinitialiser le formulaire
  if (selectedType.value === 'biberon') {
    quantity.value = undefined
  } else if (selectedType.value === 'dodo') {
    sleepHours.value = 0
    sleepMinutes.value = 0
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
        <button @click="selectedType = 'pipi'" :class="{ active: selectedType === 'pipi' }">
          Pipi
        </button>
        <button @click="selectedType = 'caca'" :class="{ active: selectedType === 'caca' }">
          Caca
        </button>
        <button @click="selectedType = 'biberon'" :class="{ active: selectedType === 'biberon' }">
          Biberon
        </button>
        <button @click="selectedType = 'dodo'" :class="{ active: selectedType === 'dodo' }">
          Dodo
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
  background-color: #f5f5f5;
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
}

.button-group {
  display: flex;
  gap: 8px;
}

button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

button.active {
  background-color: #4a86e8;
  color: white;
  border-color: #2a66c8;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Styles pour la sélection de date et heure */
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
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 16px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #45a049;
}

.submit-button:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
}

.error {
  margin-top: 12px;
  color: #f44336;
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
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}
</style>
