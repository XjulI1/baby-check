<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEventsStore } from '@/stores/events'
import type { EventType } from '@/types'

const eventStore = useEventsStore()
const selectedType = ref<EventType>('pipi')
const quantity = ref<number | undefined>(undefined)
const notes = ref('')
const submitting = ref(false)
const customTime = ref('')

// Initialiser l'heure actuelle au format HH:MM pour le champ d'heure
const setCurrentTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  customTime.value = `${hours}:${minutes}`
}

// Initialiser l'heure actuelle au chargement du composant
setCurrentTime()

const addEvent = async () => {
  submitting.value = true

  let timestamp: Date
  if (customTime.value) {
    // Créer une date avec l'heure personnalisée
    timestamp = new Date()
    const [hours, minutes] = customTime.value.split(':').map(Number)
    timestamp.setHours(hours, minutes, 0, 0)
  } else {
    // Utiliser la date et l'heure actuelles
    timestamp = new Date()
  }

  await eventStore.addEvent(selectedType.value, quantity.value, notes.value, timestamp)
  submitting.value = false

  // Réinitialiser le formulaire
  if (selectedType.value === 'biberon') {
    quantity.value = undefined
  }
  notes.value = ''
  setCurrentTime() // Mettre à jour l'heure affichée
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
      </div>
    </div>

    <div v-if="selectedType === 'biberon'" class="form-group">
      <label for="quantity">Quantité (cl):</label>
      <input type="number" id="quantity" v-model="quantity" min="0" step="5" />
    </div>

    <!-- Champ de sélection d'heure -->
    <div class="form-group time-selection">
      <label for="customTime">Heure:</label>
      <div class="time-input">
        <input type="time" id="customTime" v-model="customTime" />
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

/* Styles pour la sélection d'heure */
.time-selection {
  display: flex;
  flex-direction: column;
}

.time-input input[type='time'] {
  width: 120px;
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
</style>
